import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { PATTERNS, notBlank } from '../../shared/utils/validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, FieldErrorComponent],
  template: `
    <div class="narrow">
      <div class="card">
        <h1>Welcome back</h1>
        <p class="muted">Sign in to book vehicles and manage your trips.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) {<div class="form-error" role="alert">{{ error() }}</div>}

          <div class="field" [class.invalid]="form.controls.email.touched && form.controls.email.invalid">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" autocomplete="email" placeholder="you@example.com" />
            <app-field-error [control]="form.controls.email" label="Email" [messages]="{ pattern: 'Enter a valid email address.' }" />
          </div>

          <div class="field" [class.invalid]="form.controls.password.touched && form.controls.password.invalid">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" autocomplete="current-password" />
            <app-field-error [control]="form.controls.password" label="Password" />
          </div>

          <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="center muted mt">New here? <a routerLink="/register">Create an account</a></p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(PATTERNS.email)]],
    password: ['', [Validators.required, notBlank]],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    this.auth
      .login({ email: email.trim(), password })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Signed in successfully.');
          this.router.navigateByUrl(this.safeReturnUrl());
        },
        error: (err) => this.error.set(extractErrorMessage(err, 'We could not sign you in. Please try again.')),
      });
  }

  /** Only allow same-app relative redirects. */
  private safeReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/dashboard';
  }
}
