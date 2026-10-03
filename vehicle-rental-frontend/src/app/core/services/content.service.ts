import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Content, ContentInput } from '../models';
import { API, apiUrl } from '../utils/api.config';

/** content-service endpoints (via gateway). */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly base = apiUrl(API.content);

  getAll(): Observable<Content[]> {
    return this.http.get<Content[]>(this.base);
  }

  add(content: ContentInput): Observable<Content> {
    return this.http.post<Content>(this.base, content);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.base}/${id}`, { responseType: 'text' });
  }
}
