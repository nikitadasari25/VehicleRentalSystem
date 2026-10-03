import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer-inner">
        <span>© {{ year }} DriveEasy Vehicle Rental</span>
        <span class="footer-links">
          <a routerLink="/vehicles">Vehicles</a>
          <a routerLink="/about">About &amp; Feedback</a>
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
