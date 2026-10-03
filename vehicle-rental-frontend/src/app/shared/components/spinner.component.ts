import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `<div class="spinner-wrap" role="status" aria-live="polite">
    <span class="spinner"></span><span class="spinner-text">{{ label }}</span>
  </div>`,
})
export class SpinnerComponent {
  @Input() label = 'Loading…';
}
