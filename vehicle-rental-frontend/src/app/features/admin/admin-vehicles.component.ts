import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Vehicle } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';
import { VehicleService } from '../../core/services/vehicle.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

@Component({
  selector: 'app-admin-vehicles',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, StatusBadgeComponent, ConfirmDialogComponent],
  template: `
    <div class="page-head">
      <div><h1>Manage vehicles</h1><p>Add, edit or remove vehicles in the fleet.</p></div>
      <a class="btn btn-primary" routerLink="/admin/vehicles/new">+ Add vehicle</a>
    </div>

    @if (state.loading()) {
      <app-spinner />
    } @else if (state.error()) {
      <app-error-state [message]="state.error()!" (retry)="load()" />
    } @else if (!state.data()?.length) {
      <app-empty-state icon="🚘" title="No vehicles yet" message="Add your first vehicle to get started.">
        <a class="btn btn-primary" routerLink="/admin/vehicles/new">Add vehicle</a>
      </app-empty-state>
    } @else {
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Vehicle</th><th>Number</th><th>Type</th><th>Price / day</th><th>Status</th><th></th></tr></thead>
          <tbody>
            @for (v of state.data()!; track v.vehicleId) {
              <tr>
                <td>{{ v.vehicleId }}</td>
                <td>{{ v.brand }} {{ v.model }}</td>
                <td>{{ v.vehicleNumber }}</td>
                <td>{{ v.type }}</td>
                <td>{{ v.pricePerDay | currency: 'INR' : 'symbol' : '1.0-2' }}</td>
                <td><app-status-badge [status]="v.availabilityStatus" /></td>
                <td class="actions">
                  <a class="btn btn-outline btn-sm" [routerLink]="['/admin/vehicles', v.vehicleId, 'edit']">Edit</a>
                  <button class="btn btn-outline btn-sm" type="button" (click)="toDelete.set(v)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <app-confirm-dialog
      [open]="!!toDelete()"
      title="Delete vehicle?"
      [message]="toDelete() ? 'Delete ' + toDelete()!.brand + ' ' + toDelete()!.model + ' (' + toDelete()!.vehicleNumber + ')? This cannot be undone.' : ''"
      confirmText="Delete"
      [danger]="true"
      [busy]="deleting()"
      (confirmed)="remove()"
      (cancelled)="toDelete.set(null)"
    />
  `,
})
export class AdminVehiclesComponent {
  private readonly api = inject(VehicleService);
  private readonly toast = inject(ToastService);

  protected readonly state = new AsyncState<Vehicle[]>();
  protected readonly toDelete = signal<Vehicle | null>(null);
  protected readonly deleting = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.api.getAll(), 'We could not load vehicles.');
  }

  protected remove(): void {
    const v = this.toDelete();
    if (!v) return;
    this.deleting.set(true);
    this.api
      .delete(v.vehicleId)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.state.data.update((list) => (list ?? []).filter((x) => x.vehicleId !== v.vehicleId));
          this.toDelete.set(null);
          this.toast.success('Vehicle deleted.');
        },
        error: (err) => {
          this.toDelete.set(null);
          this.toast.error(extractErrorMessage(err, 'We could not delete the vehicle.'));
        },
      });
  }
}
