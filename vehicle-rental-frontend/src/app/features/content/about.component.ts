import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Content } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { ContentService } from '../../core/services/content.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { extractErrorMessage } from '../../core/utils/error.util';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state.component';
import { FieldErrorComponent } from '../../shared/components/field-error.component';
import { SpinnerComponent } from '../../shared/components/spinner.component';
import { AsyncState } from '../../shared/utils/async-state';
import { PATTERNS, applyServerErrors, notBlank } from '../../shared/utils/validators';
import { PUBLIC_CONTENT_TYPES } from './content.constants';
import { StarsComponent } from './stars.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ReactiveFormsModule, FieldErrorComponent, SpinnerComponent, ErrorStateComponent, EmptyStateComponent, StarsComponent],
  template: `
    <div class="medium">
      <div class="page-head"><div><h1>About DriveEasy</h1><p>Simple, transparent vehicle rental.</p></div></div>
      <div class="card mb">
        <p>
          DriveEasy lets you browse available vehicles, book them for the dates you need and pay securely online —
          all in one place. Sign up, pick a vehicle, and you're on the road.
        </p>
      </div>

      <h2>What our customers say</h2>
      @if (reviews.loading()) {
        <app-spinner />
      } @else if (reviews.error()) {
        <app-error-state [message]="reviews.error()!" (retry)="loadReviews()" />
      } @else if (!publicEntries().length) {
        <app-empty-state icon="💬" title="No reviews yet" message="Be the first to share your experience below." />
      } @else {
        <div class="grid grid-2 mb">
          @for (c of publicEntries(); track c.id) {
            <div class="card review">
              <app-stars [rating]="c.rating" />
              <p>{{ c.message }}</p>
              <strong>{{ c.name }}</strong>
            </div>
          }
        </div>
      }

      <div class="card mt" id="feedback">
        <h2>Share your feedback</h2>
        <p class="muted">Tell us about your experience or send us a query.</p>

        <form class="form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          @if (error()) {<div class="form-error" role="alert">{{ error() }}</div>}
          @if (sent()) {<div class="form-success" role="status">Thank you! Your message has been submitted.</div>}

          <div class="form-grid">
            <div class="field" [class.invalid]="form.controls.type.touched && form.controls.type.invalid">
              <label for="type">Type</label>
              <select id="type" formControlName="type">
                <option value="FEEDBACK">Feedback</option>
                <option value="REVIEW">Review</option>
                <option value="QUERY">Query</option>
              </select>
              <app-field-error [control]="form.controls.type" label="Type" />
            </div>
            <div class="field" [class.invalid]="form.controls.rating.touched && form.controls.rating.invalid">
              <label>Rating</label>
              <div class="star-input" role="radiogroup" aria-label="Rating">
                @for (n of [1, 2, 3, 4, 5]; track n) {
                  <button type="button" [class.on]="(form.controls.rating.value ?? 0) >= n" [attr.aria-label]="n + ' star'" (click)="setRating(n)">★</button>
                }
              </div>
              <app-field-error [control]="form.controls.rating" label="Rating" [messages]="{ required: 'Please choose a rating from 1 to 5.' }" />
            </div>
          </div>

          <div class="form-grid">
            <div class="field" [class.invalid]="form.controls.name.touched && form.controls.name.invalid">
              <label for="cname">Name</label>
              <input id="cname" type="text" formControlName="name" />
              <app-field-error [control]="form.controls.name" label="Name" />
            </div>
            <div class="field" [class.invalid]="form.controls.email.touched && form.controls.email.invalid">
              <label for="cemail">Email</label>
              <input id="cemail" type="email" formControlName="email" />
              <app-field-error [control]="form.controls.email" label="Email" [messages]="{ pattern: 'Enter a valid email address.' }" />
            </div>
          </div>

          <div class="field" [class.invalid]="form.controls.message.touched && form.controls.message.invalid">
            <label for="message">Message</label>
            <textarea id="message" formControlName="message" maxlength="500"></textarea>
            <span class="hint">{{ form.controls.message.value.length }}/500</span>
            <app-field-error [control]="form.controls.message" label="Message" />
          </div>

          <button class="btn btn-primary" type="submit" [disabled]="submitting()">{{ submitting() ? 'Sending…' : 'Submit' }}</button>
        </form>
      </div>
    </div>
  `,
})
export class AboutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ContentService);
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly toast = inject(ToastService);

  protected readonly reviews = new AsyncState<Content[]>();
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly sent = signal(false);

  protected readonly publicEntries = computed(() =>
    (this.reviews.data() ?? [])
      .filter((c) => PUBLIC_CONTENT_TYPES.includes((c.type || '').toUpperCase()))
      .sort((a, b) => b.id - a.id)
      .slice(0, 12),
  );

  protected readonly form = this.fb.group({
    type: this.fb.nonNullable.control('FEEDBACK', [Validators.required]),
    name: this.fb.nonNullable.control('', [Validators.required, notBlank, Validators.minLength(2), Validators.maxLength(50)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(PATTERNS.email)]),
    message: this.fb.nonNullable.control('', [Validators.required, notBlank, Validators.minLength(5), Validators.maxLength(500)]),
    rating: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(5)]),
  });

  constructor() {
    this.loadReviews();
    if (this.auth.isAuthenticated()) {
      // convenience prefill only – ignore failures
      this.users.getById(this.auth.userId()!).subscribe({
        next: (u) => this.form.patchValue({ name: u.name, email: u.email }),
        error: () => this.form.patchValue({ email: this.auth.email() }),
      });
    }
  }

  protected loadReviews(): void {
    this.reviews.load(this.api.getAll(), 'We could not load reviews right now.');
  }

  protected setRating(n: number): void {
    this.form.controls.rating.setValue(n);
    this.form.controls.rating.markAsTouched();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);
    this.sent.set(false);

    this.api
      .add({ type: v.type, name: v.name.trim(), email: v.email.trim(), message: v.message.trim(), rating: v.rating! })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.sent.set(true);
          this.toast.success('Thanks for your feedback!');
          this.form.patchValue({ message: '', rating: null });
          this.form.controls.message.markAsUntouched();
          this.form.controls.rating.markAsUntouched();
          this.loadReviews();
        },
        error: (err) => {
          if (!applyServerErrors(this.form, err)) {
            this.error.set(extractErrorMessage(err, 'We could not submit your message. Please try again.'));
          }
        },
      });
  }
}
