import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  template: `<div class="state state-error" role="alert">
    <p>{{ message }}</p>
    @if (retryable) {<button type="button" class="btn btn-outline" (click)="retry.emit()">Try again</button>}
  </div>`,
})
export class ErrorStateComponent {
  @Input() message = 'Something went wrong.';
  @Input() retryable = true;
  @Output() retry = new EventEmitter<void>();
}
