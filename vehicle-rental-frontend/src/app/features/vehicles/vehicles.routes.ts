import { Routes } from '@angular/router';

export const VEHICLE_ROUTES: Routes = [
  { path: '', title: 'Vehicles', loadComponent: () => import('./vehicle-list.component').then((m) => m.VehicleListComponent) },
  { path: ':id', title: 'Vehicle details', loadComponent: () => import('./vehicle-detail.component').then((m) => m.VehicleDetailComponent) },
];
