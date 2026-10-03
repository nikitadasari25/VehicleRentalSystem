import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/** Shows the first validation message of a control once it has been touched. */
@Component({
  selector: 'app-field-error',
  standalone: true,
  template: `@if (text) {<small class="field-error" role="alert">{{ text }}</small>}`,
})
export class FieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label = 'This field';
  /** Optional per-error-key overrides, e.g. { pattern: 'Enter 10 digits' } */
  @Input() messages: Record<string, string> = {};

  get text(): string | null {
    const c = this.control;
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    const e = c.errors;
    if (e['server']) return String(e['server']);
    for (const key of Object.keys(e)) {
      if (this.messages[key]) return this.messages[key];
    }
    if (e['required'] || e['notBlank']) return `${this.label} is required.`;
    if (e['minlength']) return `${this.label} must be at least ${e['minlength'].requiredLength} characters.`;
    if (e['maxlength']) return `${this.label} must be at most ${e['maxlength'].requiredLength} characters.`;
    if (e['email']) return 'Enter a valid email address.';
    if (e['min']) return `${this.label} must be at least ${e['min'].min}.`;
    if (e['max']) return `${this.label} must be at most ${e['max'].max}.`;
    if (e['pattern']) return `${this.label} is not in a valid format.`;
    return `${this.label} is invalid.`;
  }
}
