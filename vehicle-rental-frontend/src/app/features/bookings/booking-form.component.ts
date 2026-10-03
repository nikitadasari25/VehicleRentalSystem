import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, startWith } from 'rxjs';
import { Vehicle } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastService } from '../../core/services/toast.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { rentalDays, todayIso } from '../../core/utils/date.util';
import { extractErrorMessage } from '../../core/utils/error.util';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { applyServerErrors, dateRange, notInPast } from '../../shared/utils/validators';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, FieldErrorComponent, SpinnerComponent, ErrorStateComponent, EmptyStateComponent],
  template: `
    <div class="medium">
      <div class="page-head"><div><h1>Book a vehicle</h1><p>Select a vehicle and your rental dates.</p></div></div>

      @if (loading()) {
        <app-spinner />
      } @else if (loadError()) {
        <app-error-state [message]="loadError()!" (retry)="load()" />
      } @else if (!vehicles().length) {
        <app-empty-state icon="🚘" title="No vehicles available" message="All vehicles are currently booked or in maintenance. Please check back soon.">
          <a class="btn btn-outline" routerLink="/vehicles">Browse vehicles</a>
        </app-empty-state>
      } @else {
        <div class="card">
          @if (notice()) {<div class="alert alert-warn" role="alert">{{ notice() }}</div>}

          <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (formError()) {<div class="form-error" role="alert">{{ formError() }}</div>}

            <div class="field" [class.invalid]="form.controls.vehicleId.touched && form.controls.vehicleId.invalid">
              <label for="vehicleId">Vehicle</label>
              <select id="vehicleId" formControlName="vehicleId">
                <option [ngValue]="null" disabled>Select a vehicle…</option>
                @for (v of vehicles(); track v.vehicleId) {
                  <option [ngValue]="v.vehicleId">{{ v.brand }} {{ v.model }} ({{ v.type }}) – ₹{{ v.pricePerDay }}/day</option>
                }
              </select>
              <app-field-error [control]="form.controls.vehicleId" label="Vehicle" />
            </div>

            <div class="form-grid">
              <div class="field" [class.invalid]="form.controls.startDate.touched && form.controls.startDate.invalid">
                <label for="startDate">Pickup date</label>
                <input id="startDate" type="date" formControlName="startDate" [min]="today" />
                <app-field-error [control]="form.controls.startDate" label="Pickup date" [messages]="{ dateInPast: 'Pickup date cannot be in the past.' }" />
              </div>
              <div class="field" [class.invalid]="form.controls.endDate.touched && (form.controls.endDate.invalid || form.hasError('dateRange'))">
                <label for="endDate">Return date</label>
                <input id="endDate" type="date" formControlName="endDate" [min]="form.controls.startDate.value || today" />
                <app-field-error [control]="form.controls.endDate" label="Return date" [messages]="{ dateInPast: 'Return date cannot be in the past.' }" />
                @if (form.hasError('dateRange') && form.controls.endDate.touched) {
                  <small class="field-error" role="alert">Return date must be on or after the pickup date.</small>
                }
              </div>
            </div>

            @if (selected(); as v) {
              <div class="summary">
                <div class="row between"><span>{{ v.brand }} {{ v.model }}</span><span>{{ v.pricePerDay | currency: 'INR' : 'symbol' : '1.0-2' }} / day</span></div>
                @if (days() > 0) {
                  <div class="row between"><span>{{ days() }} day{{ days() === 1 ? '' : 's' }}</span><span class="muted small">same-day rental counts as 1 day</span></div>
                  <div class="row between"><span>Total</span><span class="total">{{ total() | currency: 'INR' : 'symbol' : '1.0-2' }}</span></div>
                } @else {
                  <span class="muted small">Choose your dates to see the total.</span>
                }
              </div>
            }

            <div class="row">
              <button class="btn btn-primary" type="submit" [disabled]="submitting()">{{ submitting() ? 'Booking…' : 'Confirm booking' }}</button>
              <a class="btn btn-outline" routerLink="/vehicles">Cancel</a>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class BookingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly vehicleApi = inject(VehicleService);
  private readonly bookingApi = inject(BookingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly today = todayIso();
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly vehicles = signal<Vehicle[]>([]);

  protected readonly form = this.fb.group(
    {
      vehicleId: this.fb.control<number | null>(null, [Validators.required]),
      startDate: this.fb.nonNullable.control('', [Validators.required, notInPast]),
      endDate: this.fb.nonNullable.control('', [Validators.required, notInPast]),
    },
    { validators: [dateRange()] },
  );

  private readonly value = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  protected readonly selected = computed(() => this.vehicles().find((v) => v.vehicleId === this.value().vehicleId) ?? null);
  protected readonly days = computed(() => {
    const v = this.value();
    return v.startDate && v.endDate ? rentalDays(v.startDate, v.endDate) : 0;
  });
  protected readonly total = computed(() => {
    const v = this.selected();
    return v ? Math.round(v.pricePerDay * this.days() * 100) / 100 : 0;
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.vehicleApi
      .getAvailable()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (list) => {
          this.vehicles.set(list);
          this.preselect(list);
        },
        error: (err) => this.loadError.set(extractErrorMessage(err, 'We could not load available vehicles.')),
      });
  }

  private preselect(list: Vehicle[]): void {
    const id = Number(this.route.snapshot.queryParamMap.get('vehicleId'));
    if (!Number.isInteger(id) || id <= 0) return;
    if (list.some((v) => v.vehicleId === id)) {
      this.form.patchValue({ vehicleId: id });
      return;
    }
    // requested vehicle is not in the available list – tell the user why
    this.vehicleApi.getById(id).subscribe({
      next: (v) => this.notice.set(`${v.brand} ${v.model} is currently ${v.availabilityStatus.toLowerCase()} and can't be booked. Please choose another vehicle.`),
      error: () => this.notice.set('The vehicle you selected could not be found. Please choose another one.'),
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const vehicle = this.selected();
    if (!vehicle || v.vehicleId === null || this.days() < 1) return;

    this.submitting.set(true);
    this.formError.set(null);

    this.bookingApi
      .create({
        userId: this.auth.userId()!,
        vehicleId: v.vehicleId,
        startDate: v.startDate,
        endDate: v.endDate,
        totalAmount: this.total(),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (res) => {
          this.toast.success('Booking confirmed!');
          this.router.navigate(['/my-bookings', res.id, 'confirmation']);
        },
        error: (err) => {
          if (applyServerErrors(this.form, err)) return;
          let msg = extractErrorMessage(err, 'We could not complete your booking. Please try again.');
          if (err instanceof HttpErrorResponse && err.status >= 500) {
            msg += ' Your booking may have been saved — please check My Bookings before trying again.';
          }
          this.formError.set(msg);
        },
      });
  }
}
