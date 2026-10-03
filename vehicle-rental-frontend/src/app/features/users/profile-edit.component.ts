import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { AsyncState } from '../../shared/utils/async-state';
import { PATTERNS, applyServerErrors, notBlank } from '../../shared/utils/validators';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, SpinnerComponent, ErrorStateComponent, FieldErrorComponent],
  template: `
    <div class="narrow">
      <div class="card">
        <h1>Edit profile</h1>

        @if (state.loading()) {
          <app-spinner />
        } @else if (state.error()) {
          <app-error-state [message]="state.error()!" (retry)="load()" />
        } @else if (state.data()) {
          <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
            @if (error()) {<div class="form-error" role="alert">{{ error() }}</div>}

            <div class="field">
              <label for="email">Email</label>
              <input id="email" type="email" [value]="state.data()!.email" readonly />
              <span class="hint">Your email cannot be changed.</span>
            </div>

            <div class="field" [class.invalid]="form.controls.name.touched && form.controls.name.invalid">
              <label for="name">Full name</label>
              <input id="name" type="text" formControlName="name" />
              <app-field-error [control]="form.controls.name" label="Name" />
            </div>

            <div class="field" [class.invalid]="form.controls.phone.touched && form.controls.phone.invalid">
              <label for="phone">Phone</label>
              <input id="phone" type="tel" inputmode="numeric" maxlength="10" formControlName="phone" />
              <app-field-error [control]="form.controls.phone" label="Phone" [messages]="{ pattern: 'Phone number must be exactly 10 digits.' }" />
            </div>

            <div class="row">
              <button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save changes' }}</button>
              <a class="btn btn-outline" routerLink="/profile">Cancel</a>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class ProfileEditComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly state = new AsyncState<User>();
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(50)]],
    phone: ['', [Validators.pattern(PATTERNS.phone)]],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.state.load(this.users.getById(this.auth.userId()!), 'We could not load your profile.', (u) => {
      this.form.patchValue({ name: u.name, phone: u.phone ?? '' });
      // the backend ignores blank values, so a phone number that exists cannot be cleared
      if (u.phone) {
        this.form.controls.phone.addValidators(Validators.required);
        this.form.controls.phone.updateValueAndValidity();
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);

    this.users
      .updateProfile(this.auth.userId()!, { name: v.name.trim(), ...(v.phone ? { phone: v.phone } : {}) })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Profile updated.');
          this.router.navigateByUrl('/profile');
        },
        error: (err) => {
          if (!applyServerErrors(this.form, err)) {
            this.error.set(extractErrorMessage(err, 'We could not update your profile.'));
          }
        },
      });
  }
}
