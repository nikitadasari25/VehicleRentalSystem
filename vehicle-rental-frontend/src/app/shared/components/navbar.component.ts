import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="container navbar-inner">
        <a class="brand" routerLink="/" (click)="close()">🚗 <span>DriveEasy</span></a>

        <button class="nav-toggle" type="button" aria-label="Toggle menu" [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(!menuOpen())">
          <span></span><span></span><span></span>
        </button>

        <nav class="nav" [class.open]="menuOpen()" aria-label="Main">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="close()">Home</a>
          <a routerLink="/vehicles" routerLinkActive="active" (click)="close()">Vehicles</a>
          <a routerLink="/about" routerLinkActive="active" (click)="close()">About &amp; Reviews</a>

          @if (auth.isLoggedIn()) {
            <a routerLink="/dashboard" routerLinkActive="active" (click)="close()">Dashboard</a>
            <a routerLink="/my-bookings" routerLinkActive="active" (click)="close()">My Bookings</a>
            @if (auth.isAdmin()) {
              <div class="dropdown" [class.open]="adminOpen()">
                <button type="button" class="dropdown-toggle" (click)="adminOpen.set(!adminOpen()); userOpen.set(false); $event.stopPropagation()">Admin ▾</button>
                <div class="dropdown-menu">
                  <a routerLink="/admin/vehicles" (click)="close()">Manage vehicles</a>
                  <a routerLink="/admin/bookings" (click)="close()">All bookings</a>
                  <a routerLink="/admin/users" (click)="close()">Users</a>
                  <a routerLink="/admin/content" (click)="close()">Feedback &amp; content</a>
                </div>
              </div>
            }
            <div class="dropdown" [class.open]="userOpen()">
              <button type="button" class="dropdown-toggle" (click)="userOpen.set(!userOpen()); adminOpen.set(false); $event.stopPropagation()">
                {{ auth.email() }} ▾
              </button>
              <div class="dropdown-menu right">
                <a routerLink="/profile" (click)="close()">Profile</a>
                <a routerLink="/subscription" (click)="close()">Subscription</a>
                <a routerLink="/account" (click)="close()">Account</a>
                <button type="button" (click)="logout()">Sign out</button>
              </div>
            </div>
          } @else {
            <a class="btn btn-outline btn-sm" routerLink="/login" (click)="close()">Sign in</a>
            <a class="btn btn-primary btn-sm" routerLink="/register" (click)="close()">Sign up</a>
          }
        </nav>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly menuOpen = signal(false);
  protected readonly userOpen = signal(false);
  protected readonly adminOpen = signal(false);

  @HostListener('document:click')
  closeDropdowns(): void {
    this.userOpen.set(false);
    this.adminOpen.set(false);
  }

  close(): void {
    this.menuOpen.set(false);
    this.userOpen.set(false);
    this.adminOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
    this.close();
    this.toast.success('You have been signed out.');
    this.router.navigateByUrl('/');
  }
}
