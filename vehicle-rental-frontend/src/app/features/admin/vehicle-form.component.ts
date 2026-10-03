import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AVAILABILITY_STATUSES, Vehicle, VehicleInput } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { PATTERNS, applyServerErrors, notBlank } from '../../shared/utils/validators';

/** Add (POST /api/vehicles) and edit (PUT /api/vehicles/{id}) – validation mirrors VehicleDTO. */
@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent, SpinnerComponent, ErrorStateComponent],
  template: `
    <div class="medium">
      <p><a routerLink="/admin/vehicles">← Back to vehicles</a></p>
      <div class="card">
        <h1>{{ editId ? 'Edit vehicle' : 'Add vehicle' }}</h1>

        @if (loading()) {
          <app-spinner />
        } @else if (loadError()) {
          <app-error-state [message]="loadError()!" (retry)="load()" />
        } @else {
          <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (error()) {<div class="form-error" role="alert">{{ error() }}</div>}

            <div class="field" [class.invalid]="form.controls.vehicleNumber.touched && form.controls.vehicleNumber.invalid">
              <label for="vehicleNumber">Registration number</label>
              <input id="vehicleNumber" type="text" formControlName="vehicleNumber" maxlength="10" placeholder="KA01AB1234" (input)="normalizeNumber()" />
              <span class="hint">Format: 2 letters, 2 digits, 2 letters, 4 digits (e.g. KA01AB1234).</span>
              <app-field-error [control]="form.controls.vehicleNumber" label="Registration number" [messages]="{ pattern: 'Vehicle number must be in format KA01AB1234.' }" />
            </div>

            <div class="form-grid">
              <div class="field" [class.invalid]="form.controls.brand.touched && form.controls.brand.invalid">
                <label for="brand">Brand</label>
                <input id="brand" type="text" formControlName="brand" />
                <app-field-error [control]="form.controls.brand" label="Brand" />
              </div>
              <div class="field" [class.invalid]="form.controls.model.touched && form.controls.model.invalid">
                <label for="model">Model</label>
                <input id="model" type="text" formControlName="model" />
                <app-field-error [control]="form.controls.model" label="Model" />
              </div>
            </div>

            <div class="form-grid">
              <div class="field" [class.invalid]="form.controls.type.touched && form.controls.type.invalid">
                <label for="type">Type</label>
                <input id="type" type="text" formControlName="type" list="type-suggestions" placeholder="e.g. Car, Bike, SUV" />
                <datalist id="type-suggestions">
                  @for (t of typeSuggestions(); track t) {<option [value]="t"></option>}
                </datalist>
                <app-field-error [control]="form.controls.type" label="Type" />
              </div>
              <div class="field" [class.invalid]="form.controls.pricePerDay.touched && form.controls.pricePerDay.invalid">
                <label for="pricePerDay">Price per day (₹)</label>
                <input id="pricePerDay" type="number" step="0.01" min="0.01" formControlName="pricePerDay" />
                <app-field-error [control]="form.controls.pricePerDay" label="Price per day" [messages]="{ min: 'Price per day must be greater than 0.' }" />
              </div>
            </div>

            <div class="field" [class.invalid]="form.controls.availabilityStatus.touched && form.controls.availabilityStatus.invalid">
              <label for="availabilityStatus">Availability status</label>
              <select id="availabilityStatus" formControlName="availabilityStatus">
                @for (s of statuses; track s) {<option [value]="s">{{ s }}</option>}
              </select>
              <app-field-error [control]="form.controls.availabilityStatus" label="Status" />
            </div>

            <div class="row">
              <button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : editId ? 'Save changes' : 'Add vehicle' }}</button>
              <a class="btn btn-outline" routerLink="/admin/vehicles">Cancel</a>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class VehicleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(VehicleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly statuses = AVAILABILITY_STATUSES;
  protected readonly editId: number | null = Number(this.route.snapshot.paramMap.get('id')) || null;

  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly typeSuggestions = signal<string[]>(['Car', 'Bike', 'SUV', 'Van', 'Truck']);

  protected readonly form = this.fb.nonNullable.group({
    vehicleNumber: ['', [Validators.required, Validators.pattern(PATTERNS.vehicleNumber)]],
    brand: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(30)]],
    model: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(30)]],
    type: ['', [Validators.required, notBlank, Validators.maxLength(30)]],
    pricePerDay: [null as number | null, [Validators.required, Validators.min(0.01)]],
    availabilityStatus: ['AVAILABLE', [Validators.required]],
  });

  constructor() {
    this.load();
    // enrich the type suggestions with the types already in use
    this.api.getAll().subscribe({
      next: (all) => {
        const merged = new Set([...this.typeSuggestions(), ...all.map((v) => v.type).filter(Boolean)]);
        this.typeSuggestions.set([...merged]);
      },
      error: () => undefined,
    });
  }

  protected load(): void {
    if (!this.editId) return;
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .getById(this.editId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (v: Vehicle) =>
          this.form.patchValue({
            vehicleNumber: v.vehicleNumber,
            brand: v.brand,
            model: v.model,
            type: v.type,
            pricePerDay: v.pricePerDay,
            availabilityStatus: v.availabilityStatus,
          }),
        error: (err) => this.loadError.set(extractErrorMessage(err, 'We could not load this vehicle.')),
      });
  }

  /** Registration numbers are upper-case with no spaces. */
  protected normalizeNumber(): void {
    const c = this.form.controls.vehicleNumber;
    const clean = c.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean !== c.value) c.setValue(clean);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload: VehicleInput = {
      vehicleNumber: v.vehicleNumber,
      brand: v.brand.trim(),
      model: v.model.trim(),
      type: v.type.trim(),
      pricePerDay: Number(v.pricePerDay),
      availabilityStatus: v.availabilityStatus as VehicleInput['availabilityStatus'],
    };

    this.saving.set(true);
    this.error.set(null);
    const call = this.editId ? this.api.update(this.editId, payload) : this.api.add(payload);

    call.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.toast.success(this.editId ? 'Vehicle updated.' : 'Vehicle added.');
        this.router.navigateByUrl('/admin/vehicles');
      },
      error: (err) => {
        if (!applyServerErrors(this.form, err)) {
          this.error.set(extractErrorMessage(err, 'We could not save the vehicle.'));
        }
      },
    });
  }
}
