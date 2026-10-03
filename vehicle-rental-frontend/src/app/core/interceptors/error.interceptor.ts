import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Handles expired / missing sessions centrally. Spring Security in user-service answers
 * unauthenticated calls with 403 (no entry point configured), so 403 with an expired or
 * missing token is treated the same as 401.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        const wasLoggedIn = auth.isLoggedIn();
        if (err.status === 401 || auth.isTokenExpired()) {
          auth.logout();
          if (wasLoggedIn) {
            toast.info('Your session has expired. Please sign in again.');
            router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
          }
        }
      }
      return throwError(() => err);
    }),
  );
};
