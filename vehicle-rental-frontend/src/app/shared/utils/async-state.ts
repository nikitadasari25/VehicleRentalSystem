import { signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';
import { extractErrorMessage } from '../../core/utils/error.util';

/** Small helper that tracks loading / error / data for one request so components stay tiny. */
export class AsyncState<T> {
  readonly data = signal<T | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  load(source: Observable<T>, fallbackError?: string, onSuccess?: (value: T) => void): void {
    this.loading.set(true);
    this.error.set(null);
    source.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (value) => {
        this.data.set(value);
        onSuccess?.(value);
      },
      error: (err) => {
        this.data.set(null);
        this.error.set(extractErrorMessage(err, fallbackError));
      },
    });
  }
}
