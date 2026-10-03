import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Booking, Vehicle } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

export interface BookingRow extends Booking {
  vehicle: Vehicle | null;
}

type Filter = 'ALL' | 'CONFIRMED' | 'CANCELED';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="page-head">
      <div><h1>My bookings</h1><p>Your booking history and their status.</p></div>
      <a class="btn btn-primary" routerLink="/vehicles">New booking</a>
    </div>

    <div class="tabs" role="tablist">
      @for (f of filters; track f.key) {
        <button type="button" class="chip-btn" [class.active]="filter() === f.key" (click)="filter.set(f.key)">{{ f.label }}</button>
      }
    </div>

    @if (state.loading()) {
      <app-spinner />
    } @else if (state.error()) {
      <app-error-state [message]="state.error()!" (retry)="load()" />
    } @else if (!rows().length) {
      <app-empty-state icon="🧳" title="No bookings to show" [message]="filter() === 'ALL' ? 'You have not made any bookings yet.' : 'No bookings with this status.'">
        <a class="btn btn-primary" routerLink="/vehicles">Find a vehicle</a>
      </app-empty-state>
    } @else {
      <div class="table-wrap">
        <table>
          <thead><tr><th>Booking</th><th>Vehicle</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (b of rows(); track b.bookingId) {
              <tr>
                <td>#{{ b.bookingId }}</td>
                <td>@if (b.vehicle) { {{ b.vehicle.brand }} {{ b.vehicle.model }} } @else { <span class="muted">Vehicle #{{ b.vehicleId }}</span> }</td>
                <td>{{ b.startDate | date: 'mediumDate' }} → {{ b.endDate | date: 'mediumDate' }}</td>
                <td>{{ b.totalAmount | currency: 'INR' : 'symbol' : '1.0-2' }}</td>
                <td><app-status-badge [status]="b.status" /></td>
                <td class="actions">
                  <a class="btn btn-outline btn-sm" [routerLink]="['/my-bookings', b.bookingId]">Details</a>
                  @if (b.status === 'CONFIRMED') {
                    <a class="btn btn-primary btn-sm" [routerLink]="['/payments/pay', b.bookingId]">Pay</a>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class BookingListComponent {
  private readonly auth = inject(AuthService);
  private readonly bookingApi = inject(BookingService);
  private readonly vehicleApi = inject(VehicleService);

  protected readonly filters: { key: Filter; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'CANCELED', label: 'Canceled' },
  ];
  protected readonly filter = signal<Filter>('ALL');
  protected readonly state = new AsyncState<BookingRow[]>();

  protected readonly rows = computed(() => {
    const all = [...(this.state.data() ?? [])].sort((a, b) => b.bookingId - a.bookingId);
    const f = this.filter();
    return f === 'ALL' ? all : all.filter((b) => b.status === f);
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    const source = this.bookingApi.getByUser(this.auth.userId()!).pipe(
      switchMap((bookings) => {
        if (!bookings.length) return of([] as BookingRow[]);
        const ids = [...new Set(bookings.map((b) => b.vehicleId))];
        return forkJoin(ids.map((id) => this.vehicleApi.getById(id).pipe(catchError(() => of(null))))).pipe(
          map((vehicles) => {
            const byId = new Map<number, Vehicle>();
            vehicles.forEach((v) => v && byId.set(v.vehicleId, v));
            return bookings.map((b) => ({ ...b, vehicle: byId.get(b.vehicleId) ?? null }));
          }),
        );
      }),
    );
    this.state.load(source, 'We could not load your bookings.');
  }
}
