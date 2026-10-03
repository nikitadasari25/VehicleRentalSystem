import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, Session, User } from '../models';
import { API, apiUrl } from '../utils/api.config';
import { decodeJwt } from '../utils/jwt.util';

const STORAGE_KEY = 'vrs.session';

/** Owns authentication state (JWT + identity claims). */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _session = signal<Session | null>(this.restore());

  readonly session = this._session.asReadonly();
  readonly isLoggedIn = computed(() => this._session() !== null);
  readonly isAdmin = computed(() => this._session()?.role === 'ADMIN');
  readonly email = computed(() => this._session()?.email ?? '');

  token(): string | null {
    return this._session()?.token ?? null;
  }

  userId(): number | null {
    return this._session()?.userId ?? null;
  }

  /** True when a session exists and its token has not expired. Clears stale sessions. */
  isAuthenticated(): boolean {
    const s = this._session();
    if (!s) return false;
    if (s.expiresAt !== null && s.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  }

  /** True when the stored token is missing or past its expiry. */
  isTokenExpired(): boolean {
    const s = this._session();
    return !s || (s.expiresAt !== null && s.expiresAt <= Date.now());
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(apiUrl(`${API.users}/register`), request);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(apiUrl(`${API.users}/login`), request)
      .pipe(tap((res) => this.startSession(res)));
  }

  logout(): void {
    this._session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  private startSession(res: LoginResponse): void {
    const claims = decodeJwt(res.token);
    const userId = Number(claims?.['userId']);
    if (!claims || !Number.isFinite(userId)) {
      throw new Error('Login response did not contain a valid token.');
    }
    const exp = Number(claims['exp']);
    const session: Session = {
      token: res.token,
      email: res.email,
      role: res.role,
      userId,
      expiresAt: Number.isFinite(exp) ? exp * 1000 : null,
    };
    this._session.set(session);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable – session lives in memory only */
    }
  }

  private restore(): Session | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      if (!s?.token || !Number.isFinite(s.userId)) return null;
      if (s.expiresAt !== null && s.expiresAt <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }
}
