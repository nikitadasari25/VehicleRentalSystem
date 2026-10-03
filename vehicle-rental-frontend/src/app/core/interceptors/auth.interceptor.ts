import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/** Public calls that must not carry a (possibly stale) bearer token. */
const PUBLIC = [/\/api\/users\/login$/, /\/api\/users\/register$/];

/** Adds `Authorization: Bearer <jwt>` to every gateway request. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const isGateway = req.url.startsWith(environment.apiBaseUrl);
  const isPublic = req.method === 'POST' && PUBLIC.some((re) => re.test(req.url));

  if (!token || !isGateway || isPublic) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
