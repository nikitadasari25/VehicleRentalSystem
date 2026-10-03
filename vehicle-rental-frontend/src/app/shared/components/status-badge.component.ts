import { Component, Input } from '@angular/core';

/** Colour-coded pill for vehicle availability and booking status. */
@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge badge-' + tone">{{ label }}</span>`,
})
export class StatusBadgeComponent {
  @Input() status = '';

  get tone(): string {
    switch ((this.status || '').toUpperCase()) {
      case 'AVAILABLE':
      case 'CONFIRMED':
      case 'SUCCESS':
        return 'green';
      case 'BOOKED':
        return 'amber';
      case 'MAINTENANCE':
      case 'CANCELED':
      case 'CANCELLED':
        return 'red';
      default:
        return 'gray';
    }
  }

  get label(): string {
    const s = (this.status || '').toLowerCase();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';
  }
}
