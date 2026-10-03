import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `<div class="state state-empty">
    <div class="state-icon" aria-hidden="true">{{ icon }}</div>
    <h3>{{ title }}</h3>
    @if (message) {<p>{{ message }}</p>}
    <ng-content />
  </div>`,
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'Nothing here yet';
  @Input() message = '';
}
