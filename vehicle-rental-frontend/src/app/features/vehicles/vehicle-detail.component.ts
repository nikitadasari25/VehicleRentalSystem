import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Vehicle } from '../../core/models';
import { VehicleService } from '../../core/services/vehicle.service';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';
import { vehicleIcon } from '../../shared/utils/vehicle-icon';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, SpinnerComponent, ErrorStateComponent, StatusBadgeComponent],
  template: `
    <p><a routerLink="/vehicles">← Back to vehicles</a></p>

    @if (state.loading()) {
      <app-spinner />
    } @else if (state.error()) {
      <app-error-state [message]="state.error()!" (retry)="load()" />
    } @else if (state.data(); as v) {
      <div class="card detail-hero">
        <div class="vehicle-art" aria-hidden="true">{{ icon(v) }}</div>
        <div>
          <div class="row between">
            <span class="chip">{{ v.type }}</span>
            <app-status-badge [status]="v.availabilityStatus" />
          </div>
          <h1 class="mt">{{ v.brand }} {{ v.model }}</h1>
          <p class="muted">{{ v.vehicleNumber }}</p>
          <p class="mt"><strong style="font-size: 1.6rem">{{ v.pricePerDay | currency: 'INR' : 'symbol' : '1.0-2' }}</strong> <span class="muted">per day</span></p>

          <dl class="kv mt">
            <dt>Brand</dt><dd>{{ v.brand }}</dd>
            <dt>Model</dt><dd>{{ v.model }}</dd>
            <dt>Type</dt><dd>{{ v.type }}</dd>
            <dt>Registration</dt><dd>{{ v.vehicleNumber }}</dd>
            <dt>Availability</dt><dd>{{ v.availabilityStatus }}</dd>
          </dl>

          <div class="row mt">
            @if (v.availabilityStatus === 'AVAILABLE') {
              <a class="btn btn-primary" routerLink="/book" [queryParams]="{ vehicleId: v.vehicleId }">Book this vehicle</a>
            } @else {
              <button class="btn btn-primary" type="button" disabled>Not available right now</button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class VehicleDetailComponent {
  private readonly api = inject(VehicleService);
  private readonly route = inject(ActivatedRoute);

  protected readonly state = new AsyncState<Vehicle>();

  constructor() {
    this.load();
  }

  protected icon(v: Vehicle): string {
    return vehicleIcon(v.type);
  }

  protected load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.state.error.set('That vehicle link is not valid.');
      return;
    }
    this.state.load(this.api.getById(id), 'We could not load this vehicle.');
  }
}
