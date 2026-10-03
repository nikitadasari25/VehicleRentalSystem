import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { fieldErrors } from '../../core/utils/error.util';
import { parseIsoDate, todayIso } from '../../core/utils/date.util';

/** Same rules as the backend DTOs so users get instant feedback. */
export const PATTERNS = {
  phone: /^[0-9]{10}$/,
  vehicleNumber: /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
};

/** Rejects values that are only whitespace. */
export const notBlank: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = c.value;
  return typeof v === 'string' && v.length > 0 && v.trim().length === 0 ? { notBlank: true } : null;
};

/** Date (yyyy-MM-dd) must not be before today. */
export const notInPast: ValidatorFn = (c: AbstractControl): ValidationErrors | null => {
  const v = c.value as string;
  if (!v) return null;
  if (!parseIsoDate(v)) return { invalidDate: true };
  return v < todayIso() ? { dateInPast: true } : null;
};

/** Group validator: endDate must be on/after startDate. */
export function dateRange(startKey = 'startDate', endKey = 'endDate'): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startKey)?.value as string;
    const end = group.get(endKey)?.value as string;
    if (!start || !end) return null;
    return end < start ? { dateRange: true } : null;
  };
}

/** Group validator: two controls must hold the same value. */
export function matchFields(a: string, b: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const va = group.get(a)?.value;
    const vb = group.get(b)?.value;
    return va && vb && va !== vb ? { mismatch: true } : null;
  };
}

/** Pushes backend field-validation errors onto the matching form controls. Returns true if any were applied. */
export function applyServerErrors(form: FormGroup, err: unknown): boolean {
  const errors = fieldErrors(err);
  if (!errors) return false;
  let applied = false;
  for (const [field, message] of Object.entries(errors)) {
    const control = form.get(field);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: message });
      control.markAsTouched();
      applied = true;
    }
  }
  return applied;
}
