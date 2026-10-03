import { CurrencyPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Vehicle } from '../../core/models';
import { StatusBadgeComponent } from './status-badge.component';
import { vehicleIcon } from '../utils/vehicle-icon';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, StatusBadgeComponent],
  template: `
    <article class="card vehicle-card">
      <div class="vehicle-art" aria-hidden="true">{{ icon }}</div>
      <div class="vehicle-body">
        <div class="vehicle-top">
          <span class="chip">{{ vehicle.type }}</span>
          <app-status-badge [status]="vehicle.availabilityStatus" />
        </div>
        <h3>{{ vehicle.brand }} {{ vehicle.model }}</h3>
        <p class="muted small">{{ vehicle.vehicleNumber }}</p>
        <div class="vehicle-price">
          <strong>{{ vehicle.pricePerDay | currency: 'INR' : 'symbol' : '1.0-2' }}</strong>
          <span class="muted small"> / day</span>
        </div>
        <div class="vehicle-actions">
          <a class="btn btn-outline btn-sm" [routerLink]="['/vehicles', vehicle.vehicleId]">Details</a>
          @if (vehicle.availabilityStatus === 'AVAILABLE') {
            <a class="btn btn-primary btn-sm" routerLink="/book" [queryParams]="{ vehicleId: vehicle.vehicleId }">Book now</a>
          }
        </div>
      </div>
    </article>
  `,
})
export class VehicleCardComponent {
  @Input({ required: true }) vehicle!: Vehicle;

  get icon(): string {
    return vehicleIcon(this.vehicle.type);
  }
}
