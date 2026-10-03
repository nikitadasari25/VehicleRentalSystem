import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  { path: 'dashboard', title: 'Dashboard', loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent) },
  { path: 'profile', title: 'My profile', loadComponent: () => import('./profile.component').then((m) => m.ProfileComponent) },
  { path: 'profile/edit', title: 'Edit profile', loadComponent: () => import('./profile-edit.component').then((m) => m.ProfileEditComponent) },
  { path: 'subscription', title: 'Subscription', loadComponent: () => import('./subscription.component').then((m) => m.SubscriptionComponent) },
  { path: 'account', title: 'Account', loadComponent: () => import('./account.component').then((m) => m.AccountComponent) },
];
