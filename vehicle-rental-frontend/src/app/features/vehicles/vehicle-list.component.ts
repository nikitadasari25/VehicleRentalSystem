import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Vehicle } from '../../core/models';
import { VehicleService } from '../../core/services/vehicle.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { VehicleCardComponent } from '../../shared/components/vehicle-card.component';

/**
 * Uses only the backend's list endpoints:
 *   all → GET /api/vehicles, available → GET /api/vehicles/available, type → GET /api/vehicles/type/{type}
 * The brand/model box filters the already-loaded list in the browser (no search API exists).
 */
@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [FormsModule, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, VehicleCardComponent],
  template: `
    <div class="page-head">
      <div><h1>Our vehicles</h1><p>Choose from our fleet and book in minutes.</p></div>
    </div>

    <div class="filters">
      <div class="row">
        <button type="button" class="chip-btn" [class.active]="!selectedType()" (click)="selectType('')">All types</button>
        @for (t of types(); track t) {
          <button type="button" class="chip-btn" [class.active]="selectedType() === t" (click)="selectType(t)">{{ t }}</button>
        }
      </div>
      <div class="row">
        <label class="checkbox">
          <input type="checkbox" [ngModel]="availableOnly()" (ngModelChange)="toggleAvailable($event)" />
          Available only
        </label>
        <input class="spacer" style="max-width: 320px" type="text" placeholder="Filter by brand or model…" [ngModel]="query()" (ngModelChange)="query.set($event)" aria-label="Filter by brand or model" />
      </div>
    </div>

    @if (loading()) {
      <app-spinner label="Loading vehicles…" />
    } @else if (error()) {
      <app-error-state [message]="error()!" (retry)="load()" />
    } @else if (!visible().length) {
      <app-empty-state icon="🚘" title="No vehicles found" [message]="emptyMessage()" />
    } @else {
      <p class="muted small">{{ visible().length }} vehicle{{ visible().length === 1 ? '' : 's' }}</p>
      <div class="grid grid-3">
        @for (v of visible(); track v.vehicleId) {
          <app-vehicle-card [vehicle]="v" />
        }
      </div>
    }
  `,
})
export class VehicleListComponent {
  private readonly api = inject(VehicleService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly knownTypes = signal<string[]>([]);

  protected readonly selectedType = signal('');
  protected readonly availableOnly = signal(false);
  protected readonly query = signal('');

  protected readonly types = computed(() => this.knownTypes());

  protected readonly visible = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.vehicles();
    if (!q) return list;
    return list.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(q));
  });

  protected readonly emptyMessage = computed(() =>
    this.vehicles().length ? 'Nothing matches your filter. Try a different brand or model.' : 'There are no vehicles for this selection right now.',
  );

  constructor() {
    this.load();
  }

  protected selectType(type: string): void {
    this.selectedType.set(type);
    this.load();
  }

  protected toggleAvailable(value: boolean): void {
    this.availableOnly.set(value);
    this.load();
  }

  protected load(): void {
    const type = this.selectedType();
    const availableOnly = this.availableOnly();

    const source = type ? this.api.getByType(type) : availableOnly ? this.api.getAvailable() : this.api.getAll();

    this.loading.set(true);
    this.error.set(null);
    source.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (list) => {
        // type endpoint returns every status; apply "available only" locally in that case
        const result = type && availableOnly ? list.filter((v) => v.availabilityStatus === 'AVAILABLE') : list;
        this.vehicles.set(result);
        if (!type && !availableOnly) this.rememberTypes(list);
      },
      error: (err) => {
        this.vehicles.set([]);
        this.error.set(extractErrorMessage(err, 'We could not load vehicles.'));
      },
    });

    // make sure the type chips exist even when the first load was a filtered one
    if (!this.knownTypes().length && (type || availableOnly)) {
      this.api.getAll().subscribe({ next: (all) => this.rememberTypes(all), error: () => undefined });
    }
  }

  private rememberTypes(list: Vehicle[]): void {
    const set = new Set(list.map((v) => v.type).filter(Boolean));
    this.knownTypes.set([...set].sort((a, b) => a.localeCompare(b)));
  }
}
