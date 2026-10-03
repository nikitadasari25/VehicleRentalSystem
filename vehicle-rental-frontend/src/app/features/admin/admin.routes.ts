import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'vehicles' },
  { path: 'vehicles', title: 'Manage vehicles', loadComponent: () => import('./admin-vehicles.component').then((m) => m.AdminVehiclesComponent) },
  { path: 'vehicles/new', title: 'Add vehicle', loadComponent: () => import('./vehicle-form.component').then((m) => m.VehicleFormComponent) },
  { path: 'vehicles/:id/edit', title: 'Edit vehicle', loadComponent: () => import('./vehicle-form.component').then((m) => m.VehicleFormComponent) },
  { path: 'bookings', title: 'All bookings', loadComponent: () => import('./admin-bookings.component').then((m) => m.AdminBookingsComponent) },
  { path: 'users', title: 'Users', loadComponent: () => import('./admin-users.component').then((m) => m.AdminUsersComponent) },
  { path: 'content', title: 'Feedback & content', loadComponent: () => import('./admin-content.component').then((m) => m.AdminContentComponent) },
];
