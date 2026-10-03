import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, ErrorStateComponent, StatusBadgeComponent],
  template: `
    <div class="medium">
      <div class="page-head">
        <div><h1>My profile</h1><p>Your account details.</p></div>
        <a class="btn btn-primary" routerLink="/profile/edit">Edit profile</a>
      </div>

      @if (state.loading()) {
        <app-spinner />
      } @else if (state.error()) {
        <app-error-state [message]="state.error()!" (retry)="load()" />
      } @else if (state.data(); as u) {
        <div class="card">
          <dl class="kv">
            <dt>Name</dt><dd>{{ u.name }}</dd>
            <dt>Email</dt><dd>{{ u.email }}</dd>
            <dt>Phone</dt><dd>{{ u.phone || 'Not provided' }}</dd>
            <dt>Role</dt><dd>{{ u.role }}</dd>
            <dt>Subscription</dt>
            <dd>
              <app-status-badge [status]="u.subscribed ? 'CONFIRMED' : 'MAINTENANCE'" />
              <span class="muted small"> {{ u.subscribed ? 'Subscribed' : 'Not subscribed' }}</span>
            </dd>
          </dl>
        </div>
        <div class="row mt">
          <a class="btn btn-outline" routerLink="/subscription">Manage subscription</a>
          <a class="btn btn-outline" routerLink="/account">Account settings</a>
        </div>
      }
    </div>
  `,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  protected readonly state = new AsyncState<User>();

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.users.getById(this.auth.userId()!), 'We could not load your profile.');
  }
}
