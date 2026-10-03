import { Component, inject } from '@angular/core';
import { User } from '../../core/models';
import { UserService } from '../../core/services/user.service';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [SpinnerComponent, ErrorStateComponent, EmptyStateComponent, StatusBadgeComponent],
  template: `
    <div class="page-head"><div><h1>Users</h1><p>All registered users.</p></div></div>

    @if (state.loading()) {
      <app-spinner />
    } @else if (state.error()) {
      <app-error-state [message]="state.error()!" (retry)="load()" />
    } @else if (!state.data()?.length) {
      <app-empty-state icon="👥" title="No users yet" />
    } @else {
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Subscription</th></tr></thead>
          <tbody>
            @for (u of state.data()!; track u.id) {
              <tr>
                <td>{{ u.id }}</td>
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.phone || '—' }}</td>
                <td>{{ u.role }}</td>
                <td><app-status-badge [status]="u.subscribed ? 'CONFIRMED' : 'MAINTENANCE'" /></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AdminUsersComponent {
  private readonly api = inject(UserService);
  protected readonly state = new AsyncState<User[]>();

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.api.getAll(), 'We could not load users.');
  }
}
