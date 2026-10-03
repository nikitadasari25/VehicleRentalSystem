import { environment } from '../../../environments/environment';

/**
 * Gateway route prefixes (see api-gateway application.properties):
 *   /api/users/**    → USER-SERVICE
 *   /api/vehicles/** → VEHICLE-SERVICE
 *   /bookings/**     → BOOKING-SERVICE
 *   /api/payments/** → PAYMENT-SERVICE
 *   /api/content/**  → CONTENT-SERVICE
 */
export const API = {
  users: '/api/users',
  vehicles: '/api/vehicles',
  bookings: '/bookings',
  payments: '/api/payments',
  content: '/api/content',
} as const;

/** Builds an absolute URL against the configured API Gateway base. */
export function apiUrl(path: string): string {
  return `${environment.apiBaseUrl}${path}`;
}
