import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Booking, BookingRequest, BookingResponse } from '../models';
import { API, apiUrl } from '../utils/api.config';

/** booking-service endpoints (via gateway). Cancel is the only update the backend supports. */
@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly base = apiUrl(API.bookings);

  create(request: BookingRequest): Observable<BookingResponse> {
    return this.http.post<BookingResponse>(this.base, request);
  }

  getById(bookingId: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.base}/${bookingId}`);
  }

  getAll(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.base);
  }

  getByUser(userId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.base}/user/${userId}`);
  }

  cancel(bookingId: number): Observable<Booking> {
    return this.http.put<Booking>(`${this.base}/${bookingId}/cancel`, null);
  }
}
