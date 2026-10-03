import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProfileUpdateRequest, User } from '../models';
import { API, apiUrl } from '../utils/api.config';

/** user-service endpoints (via gateway). */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = apiUrl(API.users);

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  updateProfile(id: number, request: ProfileUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }

  subscribe(id: number): Observable<string> {
    return this.http.post(`${this.base}/${id}/subscribe`, null, { responseType: 'text' });
  }

  unsubscribe(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}/unsubscribe`, { responseType: 'text' });
  }
}
