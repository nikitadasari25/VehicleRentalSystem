import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="state">
      <div class="state-icon" aria-hidden="true">🧭</div>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <a class="btn btn-primary" routerLink="/">Go home</a>
    </div>
  `,
})
export class NotFoundComponent {}
