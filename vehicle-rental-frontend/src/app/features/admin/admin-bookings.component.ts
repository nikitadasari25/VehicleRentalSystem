import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Booking } from '../../core/models';
import { BookingService } from '../../core/services/booking.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="page-head"><div><h1>All bookings</h1><p>Every booking in the system.</p></div></div>

    @if (state.loading()) {
      <app-spinner />
    } @else if (state.error()) {
      <app-error-state [message]="state.error()!" (retry)="load()" />
    } @else if (!rows().length) {
      <app-empty-state icon="🧳" title="No bookings yet" />
    } @else {
      <div class="table-wrap">
        <table>
          <thead><tr><th>Booking</th><th>User</th><th>Vehicle</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (b of rows(); track b.bookingId) {
              <tr>
                <td>#{{ b.bookingId }}</td>
                <td>#{{ b.userId }}</td>
                <td>#{{ b.vehicleId }}</td>
                <td>{{ b.startDate | date: 'mediumDate' }} → {{ b.endDate | date: 'mediumDate' }}</td>
                <td>{{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }}</td>
                <td><app-status-badge [status]="b.status" /></td>
                <td><a [routerLink]="['/my-bookings', b.bookingId]" [queryParams]="{ from: 'admin' }">Details</a></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AdminBookingsComponent {
  private readonly api = inject(BookingService);
  protected readonly state = new AsyncState<Booking[]>();
  protected readonly rows = computed(() => [...(this.state.data() ?? [])].sort((a, b) => b.bookingId - a.bookingId));

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.api.getAll(), 'We could not load bookings.');
  }
}
