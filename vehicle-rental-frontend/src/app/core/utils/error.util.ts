/** Minimal shape of Angular's HttpErrorResponse (kept structural so this file has no framework deps). */
export interface HttpLikeError {
  status?: number;
  error?: unknown;
}

const GENERIC = 'Something went wrong on our side. Please try again in a moment.';

/** Backend messages we recognise → friendly text shown to users. */
const KNOWN: [RegExp, string][] = [
  [/bad credentials/i, 'Invalid email or password.'],
  [/email already registered/i, 'An account with this email already exists. Try signing in instead.'],
  [/vehicle is not available/i, 'Sorry, this vehicle is no longer available for booking.'],
  [/end date must be after start date/i, 'The return date must be on or after the pickup date.'],
  [/already completed/i, 'Payment for this booking has already been completed.'],
  [/unable to create razorpay order/i, 'We could not start the payment right now. Please try again shortly.'],
  [/payment verification failed/i, 'We could not verify your payment. If money was deducted, please contact support.'],
  [/user not found/i, 'We could not find that user account.'],
  [/vehicle not found/i, 'We could not find that vehicle.'],
  [/booking not found/i, 'We could not find that booking.'],
  [/content not found/i, 'We could not find that entry.'],
];

function bodyMessage(body: unknown): string | null {
  if (typeof body === 'string') {
    const t = body.trim();
    return t && !t.startsWith('<') ? t : null;
  }
  if (body && typeof body === 'object') {
    const m = (body as Record<string, unknown>)['message'];
    if (typeof m === 'string' && m.trim()) return m.trim();
  }
  return null;
}

function knownMessage(msg: string | null): string | null {
  if (!msg) return null;
  for (const [re, text] of KNOWN) if (re.test(msg)) return text;
  return null;
}

/**
 * Spring validation errors come back as `{ fieldName: "message" }`. Returns that map,
 * or null when the error is not a field-validation error.
 */
export function fieldErrors(err: unknown): Record<string, string> | null {
  const e = err as HttpLikeError;
  if (!e || e.status !== 400 || !e.error || typeof e.error !== 'object' || Array.isArray(e.error)) return null;
  const body = e.error as Record<string, unknown>;
  if ('message' in body || 'status' in body) return null; // generic error object, not a field map
  const entries = Object.entries(body);
  if (!entries.length || !entries.every(([, v]) => typeof v === 'string')) return null;
  return body as Record<string, string>;
}

/** Turns any HTTP error into a short message that is safe to show to end users. */
export function extractErrorMessage(err: unknown, fallback: string = GENERIC): string {
  const e = err as HttpLikeError;
  const status = e?.status;

  if (status === 0) {
    return 'Unable to reach the server. Check your connection and make sure the backend gateway is running.';
  }
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 502 || status === 503 || status === 504) {
    return 'The service is temporarily unavailable. Please try again shortly.';
  }

  const fields = fieldErrors(err);
  if (fields) return Object.values(fields).join(' ');

  const msg = bodyMessage(e?.error);
  const known = knownMessage(msg);
  if (known) return known;

  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 400 || status === 409) {
    // Business-rule messages from the services are short and user-readable.
    if (msg && msg.length <= 160) return msg;
    return 'The request could not be completed. Please check your input and try again.';
  }
  return fallback;
}
