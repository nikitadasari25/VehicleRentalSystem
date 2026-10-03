/** Picks an emoji for a free-text vehicle type (the backend stores no images). */
export function vehicleIcon(type: string | null | undefined): string {
  const t = (type ?? '').toLowerCase();
  if (/(bike|motor|scooter|moped|cycle)/.test(t)) return '🏍️';
  if (/(truck|lorry|pickup|van|tempo)/.test(t)) return '🚚';
  if (/(bus|coach|traveller|tempo traveller)/.test(t)) return '🚌';
  if (/(suv|jeep|offroad|off-road)/.test(t)) return '🚙';
  return '🚗';
}
