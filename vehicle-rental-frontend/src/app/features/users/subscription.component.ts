import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge.component';
import { AsyncState } from '../../shared/utils/async-state';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [SpinnerComponent, ErrorStateComponent, StatusBadgeComponent, ConfirmDialogComponent],
  template: `
    <div class="narrow">
      <div class="page-head"><div><h1>Subscription</h1><p>Manage your subscription status.</p></div></div>

      @if (state.loading()) {
        <app-spinner />
      } @else if (state.error()) {
        <app-error-state [message]="state.error()!" (retry)="load()" />
      } @else if (state.data(); as u) {
        <div class="card">
          <div class="row between">
            <div>
              <h2>{{ u.subscribed ? 'You are subscribed' : 'You are not subscribed' }}</h2>
              <p class="muted">{{ u.subscribed ? 'Your subscription is active.' : 'Subscribe to activate your subscription.' }}</p>
            </div>
            <app-status-badge [status]="u.subscribed ? 'CONFIRMED' : 'MAINTENANCE'" />
          </div>

          @if (error()) {<div class="form-error mt" role="alert">{{ error() }}</div>}

          <div class="mt">
            @if (u.subscribed) {
              <button class="btn btn-outline" type="button" [disabled]="busy()" (click)="confirmOpen.set(true)">Unsubscribe</button>
            } @else {
              <button class="btn btn-primary" type="button" [disabled]="busy()" (click)="subscribe()">
                {{ busy() ? 'Please wait…' : 'Subscribe' }}
              </button>
            }
          </div>
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="Unsubscribe?"
      message="Your subscription will be cancelled. You can subscribe again at any time."
      confirmText="Unsubscribe"
      [danger]="true"
      [busy]="busy()"
      (confirmed)="unsubscribe()"
      (cancelled)="confirmOpen.set(false)"
    />
  `,
})
export class SubscriptionComponent {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly toast = inject(ToastService);

  protected readonly state = new AsyncState<User>();
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmOpen = signal(false);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.users.getById(this.auth.userId()!), 'We could not load your subscription.');
  }

  protected subscribe(): void {
    this.run(this.users.subscribe(this.auth.userId()!), true, 'You are now subscribed.');
  }

  protected unsubscribe(): void {
    this.run(this.users.unsubscribe(this.auth.userId()!), false, 'You have been unsubscribed.');
  }

  private run(call: ReturnType<UserService['subscribe']>, subscribed: boolean, success: string): void {
    this.busy.set(true);
    this.error.set(null);
    call.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: () => {
        this.confirmOpen.set(false);
        const u = this.state.data();
        if (u) this.state.data.set({ ...u, subscribed });
        this.toast.success(success);
      },
      error: (err) => {
        this.confirmOpen.set(false);
        this.error.set(extractErrorMessage(err, 'We could not update your subscription.'));
      },
    });
  }
}
