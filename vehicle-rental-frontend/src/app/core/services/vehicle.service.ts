import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Vehicle, VehicleInput } from '../models';
import { API, apiUrl } from '../utils/api.config';

/** vehicle-service endpoints (via gateway). There is intentionally no "search" endpoint. */
@Injectable({ providedIn: 'root' })
export class VehicleService {
  private readonly http = inject(HttpClient);
  private readonly base = apiUrl(API.vehicles);

  getAll(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.base);
  }

  getAvailable(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.base}/available`);
  }

  getByType(type: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.base}/type/${encodeURIComponent(type)}`);
  }

  getById(id: number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.base}/${id}`);
  }

  add(vehicle: VehicleInput): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.base, vehicle);
  }

  update(id: number, vehicle: VehicleInput): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.base}/${id}`, vehicle);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }
}
