import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Payment success / failure screen. Driven purely by query params set by the payment flow. */
@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="narrow">
      <div class="card center">
        @if (success) {
          <div class="state-icon" aria-hidden="true">✅</div>
          <h1>Payment successful</h1>
          <p class="muted">Thank you! Your payment for booking #{{ bookingId }} was verified.</p>
        } @else {
          <div class="state-icon" aria-hidden="true">❌</div>
          <h1>Payment failed</h1>
          <p class="muted">{{ reason }}</p>
        }
        <div class="row mt" style="justify-content: center">
          @if (!success && bookingId) {
            <a class="btn btn-primary" [routerLink]="['/payments/pay', bookingId]">Try again</a>
          }
          @if (bookingId) {
            <a class="btn btn-outline" [routerLink]="['/my-bookings', bookingId]">View booking</a>
          }
          <a class="btn btn-outline" routerLink="/my-bookings">All bookings</a>
        </div>
      </div>
    </div>
  `,
})
export class PaymentResultComponent {
  private readonly params = inject(ActivatedRoute).snapshot.queryParamMap;

  protected readonly success = this.params.get('status') === 'success';
  protected readonly bookingId = Number(this.params.get('bookingId')) || null;
  protected readonly reason = this.params.get('reason') || 'The payment could not be completed.';
}
