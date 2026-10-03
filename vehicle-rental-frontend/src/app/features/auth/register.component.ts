import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { PATTERNS, applyServerErrors, matchFields, notBlank } from '../../shared/utils/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="narrow">
      <div class="card">
        <h1>Create your account</h1>
        <p class="muted">It takes less than a minute.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) {<div class="form-error" role="alert">{{ error() }}</div>}

          <div class="field" [class.invalid]="form.controls.name.touched && form.controls.name.invalid">
            <label for="name">Full name</label>
            <input id="name" type="text" formControlName="name" autocomplete="name" />
            <app-field-error [control]="form.controls.name" label="Name" />
          </div>

          <div class="field" [class.invalid]="form.controls.email.touched && form.controls.email.invalid">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" />
            <app-field-error [control]="form.controls.email" label="Email" [messages]="{ pattern: 'Enter a valid email address.' }" />
          </div>

          <div class="field" [class.invalid]="form.controls.phone.touched && form.controls.phone.invalid">
            <label for="phone">Phone <span class="muted">(optional)</span></label>
            <input id="phone" type="tel" inputmode="numeric" maxlength="10" formControlName="phone" autocomplete="tel" placeholder="10 digit number" />
            <app-field-error [control]="form.controls.phone" label="Phone" [messages]="{ pattern: 'Phone number must be exactly 10 digits.' }" />
          </div>

          <div class="field" [class.invalid]="form.controls.password.touched && form.controls.password.invalid">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="new-password" />
            <span class="hint">At least 8 characters.</span>
            <app-field-error [control]="form.controls.password" label="Password" />
          </div>

          <div class="field" [class.invalid]="form.controls.confirmPassword.touched && (form.controls.confirmPassword.invalid || form.hasError('mismatch'))">
            <label for="confirmPassword">Confirm password</label>
            <input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password" />
            <app-field-error [control]="form.controls.confirmPassword" label="Confirmation" />
            @if (form.hasError('mismatch') && form.controls.confirmPassword.touched) {
              <small class="field-error" role="alert">Passwords do not match.</small>
            }
          </div>

          <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="center muted mt">Already registered? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(PATTERNS.email)]],
      phone: ['', [Validators.pattern(PATTERNS.phone)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [matchFields('password', 'confirmPassword')] },
  );

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const email = v.email.trim();
    const request = {
      name: v.name.trim(),
      email,
      password: v.password,
      // backend rejects an empty-string phone, so only send it when provided
      ...(v.phone ? { phone: v.phone } : {}),
    };

    this.loading.set(true);
    this.error.set(null);

    this.auth
      .register(request)
      .pipe(
        // the register endpoint returns no token, so sign in right away
        switchMap(() => this.auth.login({ email, password: v.password })),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toast.success('Account created. Welcome aboard!');
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          if (!applyServerErrors(this.form, err)) {
            this.error.set(extractErrorMessage(err, 'We could not create your account. Please try again.'));
          }
        },
      });
  }
}
