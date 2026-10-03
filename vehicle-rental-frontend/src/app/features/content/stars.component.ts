import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stars',
  standalone: true,
  template: `<span class="stars" [attr.aria-label]="rating + ' out of 5'" role="img">
    @for (n of [1, 2, 3, 4, 5]; track n) {<span [class.off]="n > rating">★</span>}
  </span>`,
})
export class StarsComponent {
  @Input() rating = 0;
}
