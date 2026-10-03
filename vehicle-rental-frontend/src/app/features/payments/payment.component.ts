import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Booking, PaymentVerificationRequest, User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { PaymentService } from '../../core/services/payment.service';
import { UserService } from '../../core/services/user.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

type Phase = 'ready' | 'creating' | 'checkout' | 'verifying';

/**
 * Payment flow (all calls via the gateway):
 *   POST /api/payments/create-order → Razorpay Checkout (client) → POST /api/payments/verify
 */
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SpinnerComponent, ErrorStateComponent, StatusBadgeComponent],
  template: `
    <div class="narrow">
      <p><a routerLink="/my-bookings">← Back to bookings</a></p>

      @if (loading()) {
        <app-spinner />
      } @else if (loadError()) {
        <app-error-state [message]="loadError()!" (retry)="load()" />
      } @else if (booking(); as b) {
        <div class="card">
          <div class="row between">
            <h1>Payment</h1>
            <app-status-badge [status]="b.status" />
          </div>

          <dl class="kv mt">
            <dt>Booking</dt><dd>#{{ b.bookingId }}</dd>
            <dt>Dates</dt><dd>{{ b.startDate | date: 'mediumDate' }} → {{ b.endDate | date: 'mediumDate' }}</dd>
            <dt>Amount due</dt><dd>{{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }}</dd>
          </dl>

          @if (alreadyPaid()) {
            <div class="alert alert-success mt" role="status">✅ Payment for this booking has already been completed.</div>
            <a class="btn btn-outline" [routerLink]="['/my-bookings', b.bookingId]">View booking</a>
          } @else if (b.status !== 'CONFIRMED') {
            <div class="alert alert-warn mt" role="alert">This booking is {{ b.status.toLowerCase() }}, so it cannot be paid.</div>
            <a class="btn btn-outline" [routerLink]="['/my-bookings', b.bookingId]">View booking</a>
          } @else {
            @if (payError()) {<div class="form-error mt" role="alert">{{ payError() }}</div>}
            <button class="btn btn-primary btn-block mt" type="button" [disabled]="phase() !== 'ready'" (click)="pay(b)">
              @switch (phase()) {
                @case ('creating') { Preparing payment… }
                @case ('checkout') { Complete the payment in the popup… }
                @case ('verifying') { Verifying payment… }
                @default { Pay {{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }} securely }
              }
            </button>
            <p class="muted small center mt">Payments are processed securely by Razorpay.</p>
          }
        </div>
      }
    </div>
  `,
})
export class PaymentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly bookingApi = inject(BookingService);
  private readonly userApi = inject(UserService);
  private readonly payments = inject(PaymentService);

  protected readonly booking = signal<Booking | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly payError = signal<string | null>(null);
  protected readonly alreadyPaid = signal(false);
  protected readonly phase = signal<Phase>('ready');

  private profile: User | null = null;

  constructor() {
    this.load();
  }

  protected load(): void {
    const id = Number(this.route.snapshot.paramMap.get('bookingId'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.loadError.set('That payment link is not valid.');
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    this.bookingApi
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (b) => {
          if (!this.auth.isAdmin() && b.userId !== this.auth.userId()) {
            this.loadError.set('You do not have access to this booking.');
            return;
          }
          this.booking.set(b);
          // used only to prefill the checkout form; failure is harmless
          this.userApi.getById(this.auth.userId()!).subscribe({ next: (u) => (this.profile = u), error: () => undefined });
        },
        error: (err) => this.loadError.set(extractErrorMessage(err, 'We could not load this booking.')),
      });
  }

  protected pay(b: Booking): void {
    this.payError.set(null);
    this.phase.set('creating');

    this.payments.createOrder({ bookingId: b.bookingId, amount: b.totalAmount }).subscribe({
      next: (order) => {
        this.phase.set('checkout');
        this.payments
          .openCheckout(
            order,
            `Booking #${b.bookingId}`,
            { name: this.profile?.name, email: this.profile?.email ?? this.auth.email(), contact: this.profile?.phone ?? undefined },
            {
              onSuccess: (res) => this.verify(b, res),
              onFailure: (message) => this.fail(b, message),
              onDismiss: () => {
                if (this.phase() === 'checkout') {
                  this.phase.set('ready');
                  this.payError.set('Payment was cancelled. You can try again whenever you are ready.');
                }
              },
            },
          )
          .catch((e: unknown) => {
            this.phase.set('ready');
            this.payError.set(e instanceof Error ? e.message : 'Could not open the payment window.');
          });
      },
      error: (err) => {
        this.phase.set('ready');
        const msg = extractErrorMessage(err, 'We could not start the payment. Please try again.');
        if (/already been completed/i.test(msg)) {
          this.alreadyPaid.set(true);
        } else {
          this.payError.set(msg);
        }
      },
    });
  }

  private verify(b: Booking, res: PaymentVerificationRequest): void {
    this.phase.set('verifying');
    this.payments.verify(res).subscribe({
      next: () =>
        this.router.navigate(['/payments/result'], { queryParams: { status: 'success', bookingId: b.bookingId } }),
      error: (err) => {
        this.phase.set('ready');
        this.router.navigate(['/payments/result'], {
          queryParams: { status: 'failed', bookingId: b.bookingId, reason: extractErrorMessage(err, 'We could not verify your payment.') },
        });
      },
    });
  }

  private fail(b: Booking, reason: string): void {
    this.phase.set('ready');
    this.router.navigate(['/payments/result'], { queryParams: { status: 'failed', bookingId: b.bookingId, reason } });
  }
}
