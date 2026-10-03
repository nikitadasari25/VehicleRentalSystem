import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { Booking, Vehicle } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastService } from '../../core/services/toast.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { rentalDays } from '../../core/utils/date.util';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';

/** Used for both /my-bookings/:id and /my-bookings/:id/confirmation (route data.confirmation). */
@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SpinnerComponent, ErrorStateComponent, StatusBadgeComponent, ConfirmDialogComponent],
  template: `
    <div class="medium">
      <p><a [routerLink]="auth.isAdmin() && fromAdmin ? '/admin/bookings' : '/my-bookings'">← Back to bookings</a></p>

      @if (loading()) {
        <app-spinner />
      } @else if (error()) {
        <app-error-state [message]="error()!" (retry)="load()" />
      } @else if (booking(); as b) {
        @if (confirmation && b.status === 'CONFIRMED') {
          <div class="alert alert-success" role="status">
            <strong>🎉 Your booking is confirmed!</strong> Booking #{{ b.bookingId }} has been created. Complete the payment to finish.
          </div>
        }
        @if (actionError()) {<div class="form-error mb" role="alert">{{ actionError() }}</div>}

        <div class="card">
          <div class="row between">
            <h1>Booking #{{ b.bookingId }}</h1>
            <app-status-badge [status]="b.status" />
          </div>

          <dl class="kv mt">
            <dt>Vehicle</dt>
            <dd>
              @if (vehicle(); as v) { <a [routerLink]="['/vehicles', v.vehicleId]">{{ v.brand }} {{ v.model }}</a> ({{ v.vehicleNumber }}) }
              @else { Vehicle #{{ b.vehicleId }} }
            </dd>
            <dt>Pickup date</dt><dd>{{ b.startDate | date: 'fullDate' }}</dd>
            <dt>Return date</dt><dd>{{ b.endDate | date: 'fullDate' }}</dd>
            <dt>Duration</dt><dd>{{ days(b) }} day{{ days(b) === 1 ? '' : 's' }}</dd>
            <dt>Booked on</dt><dd>{{ b.bookingDate | date: 'mediumDate' }}</dd>
            @if (b.pickupLocation) {<dt>Pickup location</dt><dd>{{ b.pickupLocation }}</dd>}
            <dt>Total amount</dt><dd>{{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }}</dd>
          </dl>

          @if (b.status === 'CONFIRMED') {
            <div class="row mt">
              <a class="btn btn-primary" [routerLink]="['/payments/pay', b.bookingId]">Pay now</a>
              <button class="btn btn-outline" type="button" (click)="confirmOpen.set(true)">Cancel booking</button>
            </div>
            <p class="muted small mt">Already paid? The payment page will let you know.</p>
          }
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="Cancel this booking?"
      message="The booking will be marked as canceled. This cannot be undone."
      confirmText="Yes, cancel booking"
      cancelText="Keep booking"
      [danger]="true"
      [busy]="cancelling()"
      (confirmed)="cancel()"
      (cancelled)="confirmOpen.set(false)"
    />
  `,
})
export class BookingDetailComponent {
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly bookingApi = inject(BookingService);
  private readonly vehicleApi = inject(VehicleService);
  private readonly toast = inject(ToastService);

  protected readonly confirmation = !!this.route.snapshot.data['confirmation'];
  protected readonly fromAdmin = this.route.snapshot.queryParamMap.get('from') === 'admin';

  protected readonly booking = signal<Booking | null>(null);
  protected readonly vehicle = signal<Vehicle | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly actionError = signal<string | null>(null);
  protected readonly confirmOpen = signal(false);
  protected readonly cancelling = signal(false);

  constructor() {
    this.load();
  }

  protected days(b: Booking): number {
    return rentalDays(b.startDate, b.endDate);
  }

  protected load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.error.set('That booking link is not valid.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.bookingApi
      .getById(id)
      .pipe(
        switchMap((b) =>
          this.vehicleApi.getById(b.vehicleId).pipe(
            catchError(() => of(null)),
            map((v) => ({ b, v })),
          ),
        ),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ b, v }) => {
          // UX guard: the backend does not enforce ownership, so hide other users' bookings in the UI
          if (!this.auth.isAdmin() && b.userId !== this.auth.userId()) {
            this.error.set('You do not have access to this booking.');
            return;
          }
          this.booking.set(b);
          this.vehicle.set(v);
        },
        error: (err) => this.error.set(extractErrorMessage(err, 'We could not load this booking.')),
      });
  }

  protected cancel(): void {
    const b = this.booking();
    if (!b) return;
    this.cancelling.set(true);
    this.actionError.set(null);
    this.bookingApi
      .cancel(b.bookingId)
      .pipe(finalize(() => this.cancelling.set(false)))
      .subscribe({
        next: (updated) => {
          this.booking.set(updated);
          this.confirmOpen.set(false);
          this.toast.success('Booking canceled.');
        },
        error: (err) => {
          this.confirmOpen.set(false);
          this.actionError.set(extractErrorMessage(err, 'We could not cancel this booking.'));
        },
      });
  }
}
