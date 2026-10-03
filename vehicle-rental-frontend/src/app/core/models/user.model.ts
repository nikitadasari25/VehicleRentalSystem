export type Role = 'USER' | 'ADMIN';

/** Mirrors user-service `User` entity (password is never returned). */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  subscribed: boolean;
}

/** POST /api/users/register */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** POST /api/users/login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors user-service `LoginResponse`. */
export interface LoginResponse {
  token: string;
  email: string;
  role: Role;
}

/** PUT /api/users/{id} */
export interface ProfileUpdateRequest {
  name?: string;
  phone?: string;
}

/** Client-side session derived from the login response + JWT claims. */
export interface Session {
  token: string;
  email: string;
  role: Role;
  userId: number;
  /** epoch millis, null when the token carries no `exp` claim */
  expiresAt: number | null;
}
