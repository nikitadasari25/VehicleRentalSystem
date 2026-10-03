import { Routes } from '@angular/router';

export const PAYMENT_ROUTES: Routes = [
  { path: 'pay/:bookingId', title: 'Payment', loadComponent: () => import('./payment.component').then((m) => m.PaymentComponent) },
  { path: 'result', title: 'Payment status', loadComponent: () => import('./payment-result.component').then((m) => m.PaymentResultComponent) },
];
