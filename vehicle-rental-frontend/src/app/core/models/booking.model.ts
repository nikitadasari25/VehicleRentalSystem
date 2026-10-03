export type BookingStatus = 'CONFIRMED' | 'CANCELED' | string;

/** Mirrors booking-service `Booking` entity (returned by GET/cancel endpoints). */
export interface Booking {
  bookingId: number;
  userId: number;
  vehicleId: number;
  bookingDate: string; // yyyy-MM-dd
  startDate: string;
  endDate: string;
  pickupLocation: string | null;
  totalAmount: number;
  status: BookingStatus;
}

/** POST /bookings body (booking-service `BookingRequest`). */
export interface BookingRequest {
  userId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
}

/** Response of POST /bookings (booking-service `BookingResponse`) – note `id`, not `bookingId`. */
export interface BookingResponse {
  id: number;
  userId: number;
  vehicleId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: BookingStatus;
}
