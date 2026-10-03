import { Routes } from '@angular/router';

/** Browser routes are /my-bookings and /book (not /bookings, which is a gateway path). */
export const BOOKING_ROUTES: Routes = [
  { path: 'book', title: 'Book a vehicle', loadComponent: () => import('./booking-form.component').then((m) => m.BookingFormComponent) },
  { path: 'my-bookings', title: 'My bookings', loadComponent: () => import('./booking-list.component').then((m) => m.BookingListComponent) },
  {
    path: 'my-bookings/:id/confirmation',
    title: 'Booking confirmed',
    data: { confirmation: true },
    loadComponent: () => import('./booking-detail.component').then((m) => m.BookingDetailComponent),
  },
  { path: 'my-bookings/:id', title: 'Booking details', loadComponent: () => import('./booking-detail.component').then((m) => m.BookingDetailComponent) },
];
