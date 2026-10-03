import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Content, Vehicle } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ContentService } from '../../core/services/content.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { VehicleCardComponent } from '../../shared/components/vehicle-card.component';
import { AsyncState } from '../../shared/utils/async-state';
import { PUBLIC_CONTENT_TYPES } from '../content/content.constants';
import { StarsComponent } from '../content/stars.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, VehicleCardComponent, StarsComponent],
  template: `
    <section class="hero">
      <h1>Rent the right ride, in minutes.</h1>
      <p>Browse available vehicles, book for the dates you need and pay securely online.</p>
      <div class="row">
        <a class="btn btn-primary" style="background:#fff;color:#1d4ed8" routerLink="/vehicles">Browse vehicles</a>
        @if (!auth.isLoggedIn()) {
          <a class="btn btn-outline" routerLink="/register">Create account</a>
        } @else {
          <a class="btn btn-outline" routerLink="/my-bookings">My bookings</a>
        }
      </div>
    </section>

    <section class="section">
      <div class="page-head">
        <div><h2>Available now</h2><p>Ready to book today.</p></div>
        <a routerLink="/vehicles">See all vehicles →</a>
      </div>
      @if (vehicles.loading()) {
        <app-spinner />
      } @else if (vehicles.error()) {
        <app-error-state [message]="vehicles.error()!" (retry)="loadVehicles()" />
      } @else if (!featured().length) {
        <app-empty-state icon="🚘" title="No vehicles available right now" message="Please check back soon." />
      } @else {
        <div class="grid grid-3">
          @for (v of featured(); track v.vehicleId) {<app-vehicle-card [vehicle]="v" />}
        </div>
      }
    </section>

    <section class="section">
      <h2>How it works</h2>
      <div class="grid grid-3 steps">
        <div class="card"><h3>Pick a vehicle</h3><p class="muted">Filter by type and choose from vehicles that are available.</p></div>
        <div class="card"><h3>Choose your dates</h3><p class="muted">Select pickup and return dates and see your total up front.</p></div>
        <div class="card"><h3>Pay securely</h3><p class="muted">Complete the payment online and manage your bookings anytime.</p></div>
      </div>
    </section>

    @if (topReviews().length) {
      <section class="section">
        <div class="page-head"><h2>What customers say</h2><a routerLink="/about">More reviews →</a></div>
        <div class="grid grid-3">
          @for (c of topReviews(); track c.id) {
            <div class="card review">
              <app-stars [rating]="c.rating" />
              <p>{{ c.message }}</p>
              <strong>{{ c.name }}</strong>
            </div>
          }
        </div>
      </section>
    }
  `,
})
export class HomeComponent {
  protected readonly auth = inject(AuthService);
  private readonly vehicleApi = inject(VehicleService);
  private readonly contentApi = inject(ContentService);

  protected readonly vehicles = new AsyncState<Vehicle[]>();
  protected readonly reviews = new AsyncState<Content[]>();

  protected readonly featured = computed(() => (this.vehicles.data() ?? []).slice(0, 4));
  protected readonly topReviews = computed(() =>
    (this.reviews.data() ?? [])
      .filter((c) => PUBLIC_CONTENT_TYPES.includes((c.type || '').toUpperCase()))
      .sort((a, b) => b.rating - a.rating || b.id - a.id)
      .slice(0, 3),
  );

  constructor() {
    this.loadVehicles();
    // reviews are a bonus section: if they fail to load we simply don't show it
    this.reviews.load(this.contentApi.getAll());
  }

  protected loadVehicles(): void {
    this.vehicles.load(this.vehicleApi.getAvailable(), 'We could not load vehicles right now.');
  }
}
