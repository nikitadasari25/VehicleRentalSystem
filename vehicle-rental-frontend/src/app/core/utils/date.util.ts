const pad = (n: number) => String(n).padStart(2, '0');

/** Formats a Date as yyyy-MM-dd using LOCAL time (avoids the UTC shift of toISOString). */
export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

/** Parses yyyy-MM-dd as local midnight. Returns null when invalid. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d ? date : null;
}

/** Number of chargeable rental days: end - start, with a minimum of 1 (same-day rental = 1 day). */
export function rentalDays(startIso: string, endIso: string): number {
  const s = parseIsoDate(startIso);
  const e = parseIsoDate(endIso);
  if (!s || !e) return 0;
  const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000);
  if (diff < 0) return 0;
  return Math.max(1, diff);
}
