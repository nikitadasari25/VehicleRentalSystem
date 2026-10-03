export type AvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE';

export const AVAILABILITY_STATUSES: AvailabilityStatus[] = ['AVAILABLE', 'BOOKED', 'MAINTENANCE'];

/** Mirrors vehicle-service `VehicleDTO`. */
export interface Vehicle {
  vehicleId: number;
  vehicleNumber: string;
  brand: string;
  model: string;
  type: string;
  pricePerDay: number;
  availabilityStatus: AvailabilityStatus;
}

/** Body for POST /api/vehicles and PUT /api/vehicles/{id}. */
export type VehicleInput = Omit<Vehicle, 'vehicleId'>;
