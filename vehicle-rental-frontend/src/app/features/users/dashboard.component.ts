import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Booking, User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { UserService } from '../../core/services/user.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="page-head">
      <div>
        <h1>Hello{{ profile.data() ? ', ' + profile.data()!.name : '' }} 👋</h1>
        <p>Here is an overview of your account.</p>
      </div>
      <a class="btn btn-primary" routerLink="/vehicles">Browse vehicles</a>
    </div>

    @if (profile.error()) {
      <app-error-state [message]="profile.error()!" (retry)="loadProfile()" />
    }

    <div class="grid grid-stats mb">
      <div class="card stat">
        <div class="stat-value">{{ bookings.data()?.length ?? '–' }}</div>
        <div class="stat-label">Total bookings</div>
      </div>
      <div class="card stat">
        <div class="stat-value">{{ confirmedCount() }}</div>
        <div class="stat-label">Confirmed bookings</div>
      </div>
      <div class="card stat">
        <div class="stat-value">
          @if (profile.data()) { {{ profile.data()!.subscribed ? 'Active' : 'Not subscribed' }} } @else { – }
        </div>
        <div class="stat-label"><a routerLink="/subscription">Manage subscription</a></div>
      </div>
    </div>

    <div class="page-head">
      <h2>Recent bookings</h2>
      <a routerLink="/my-bookings">View all</a>
    </div>

    @if (bookings.loading()) {
      <app-spinner />
    } @else if (bookings.error()) {
      <app-error-state [message]="bookings.error()!" (retry)="loadBookings()" />
    } @else if (!recent().length) {
      <app-empty-state icon="🧳" title="No bookings yet" message="Pick a vehicle and make your first booking.">
        <a class="btn btn-primary" routerLink="/vehicles">Find a vehicle</a>
      </app-empty-state>
    } @else {
      <div class="table-wrap">
        <table>
          <thead><tr><th>Booking</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (b of recent(); track b.bookingId) {
              <tr>
                <td>#{{ b.bookingId }}</td>
                <td>{{ b.startDate | date: 'mediumDate' }} → {{ b.endDate | date: 'mediumDate' }}</td>
                <td>{{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }}</td>
                <td><app-status-badge [status]="b.status" /></td>
                <td><a [routerLink]="['/my-bookings', b.bookingId]">Details</a></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class DashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly bookingApi = inject(BookingService);

  protected readonly profile = new AsyncState<User>();
  protected readonly bookings = new AsyncState<Booking[]>();

  protected readonly confirmedCount = computed(() => (this.bookings.data() ?? []).filter((b) => b.status === 'CONFIRMED').length);
  protected readonly recent = computed(() =>
    [...(this.bookings.data() ?? [])].sort((a, b) => b.bookingId - a.bookingId).slice(0, 5),
  );

  constructor() {
    this.loadProfile();
    this.loadBookings();
  }

  protected loadProfile(): void {
    this.profile.load(this.users.getById(this.auth.userId()!), 'We could not load your profile.');
  }

  protected loadBookings(): void {
    this.bookings.load(this.bookingApi.getByUser(this.auth.userId()!), 'We could not load your bookings.');
  }
}
