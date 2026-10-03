import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { extractErrorMessage } from '../../core/utils/error.util';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="medium">
      <div class="page-head"><div><h1>Account</h1><p>{{ auth.email() }}</p></div></div>

      <div class="card mb">
        <h2>Profile &amp; subscription</h2>
        <p class="muted">Update your details or manage your subscription.</p>
        <div class="row">
          <a class="btn btn-outline" routerLink="/profile/edit">Edit profile</a>
          <a class="btn btn-outline" routerLink="/subscription">Subscription</a>
        </div>
      </div>

      <div class="card danger-zone">
        <h2>Delete account</h2>
        <p class="muted">This permanently deletes your account. This action cannot be undone.</p>

        @if (!confirming()) {
          <button class="btn btn-danger" type="button" (click)="confirming.set(true)">Delete my account</button>
        } @else {
          <div class="form">
            @if (error()) {<div class="form-error" role="alert">{{ error() }}</div>}
            <div class="field">
              <label for="confirm">Type <strong>DELETE</strong> to confirm</label>
              <input id="confirm" type="text" [formControl]="confirmText" autocomplete="off" />
            </div>
            <div class="row">
              <button class="btn btn-danger" type="button" [disabled]="confirmText.value !== 'DELETE' || busy()" (click)="deleteAccount()">
                {{ busy() ? 'Deleting…' : 'Permanently delete' }}
              </button>
              <button class="btn btn-outline" type="button" [disabled]="busy()" (click)="cancel()">Cancel</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AccountComponent {
  protected readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly confirming = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmText = new FormControl('', { nonNullable: true, validators: [Validators.required] });

  protected cancel(): void {
    this.confirming.set(false);
    this.confirmText.reset('');
    this.error.set(null);
  }

  protected deleteAccount(): void {
    if (this.confirmText.value !== 'DELETE') return;
    this.busy.set(true);
    this.error.set(null);
    this.users
      .delete(this.auth.userId()!)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.auth.logout();
          this.toast.success('Your account has been deleted.');
          this.router.navigateByUrl('/');
        },
        error: (err) => this.error.set(extractErrorMessage(err, 'We could not delete your account.')),
      });
  }
}
