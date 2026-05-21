import { formatInTimeZone } from 'date-fns-tz';

const TZ = 'Asia/Colombo';

const currency = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  maximumFractionDigits: 0,
});

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return currency.format(n);
}

export function formatDate(value: string | Date | null | undefined, pattern = 'd MMM yyyy'): string {
  if (!value) return '—';
  try {
    return formatInTimeZone(value, TZ, pattern);
  } catch {
    return '—';
  }
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'd MMM yyyy · h:mm a');
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '—';
  // value like "09:00" or "09:00:00"
  const [h, m] = value.split(':');
  if (h === undefined || m === undefined) return value;
  const hh = parseInt(h, 10);
  const period = hh >= 12 ? 'PM' : 'AM';
  const display = hh % 12 === 0 ? 12 : hh % 12;
  return `${display}:${m} ${period}`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '·';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function passbookDisplay(passbookNo: string | null | undefined): string {
  if (!passbookNo) return 'MH · 0000 · 00000';
  return passbookNo.replace(/-/g, ' · ');
}
