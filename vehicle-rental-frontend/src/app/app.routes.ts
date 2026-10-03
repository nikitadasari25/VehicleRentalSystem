import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards/auth.guard';

/**
 * NOTE: browser routes deliberately avoid the gateway path prefixes (/api/**, /bookings/**),
 * otherwise the dev-server proxy would forward page reloads to the backend.
 */
export const routes: Routes = [
  { path: '', title: 'DriveEasy – Vehicle Rental', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },

  // Public
  { path: 'vehicles', loadChildren: () => import('./features/vehicles/vehicles.routes').then((m) => m.VEHICLE_ROUTES) },
  { path: 'about', title: 'About & Reviews', loadComponent: () => import('./features/content/about.component').then((m) => m.AboutComponent) },

  // Auth (guests only)
  { path: 'login', canActivate: [guestGuard], title: 'Sign in', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], title: 'Create account', loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent) },

  // Authenticated
  { path: '', canActivate: [authGuard], loadChildren: () => import('./features/users/users.routes').then((m) => m.USER_ROUTES) },
  { path: '', canActivate: [authGuard], loadChildren: () => import('./features/bookings/bookings.routes').then((m) => m.BOOKING_ROUTES) },
  { path: 'payments', canActivate: [authGuard], loadChildren: () => import('./features/payments/payments.routes').then((m) => m.PAYMENT_ROUTES) },

  // Admin
  { path: 'admin', canActivate: [adminGuard], loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES) },

  { path: '**', title: 'Page not found', loadComponent: () => import('./features/home/not-found.component').then((m) => m.NotFoundComponent) },
];
