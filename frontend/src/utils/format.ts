const DEFAULT_LOCALE = 'vi-VN';

export function formatNumber(value: number | null | undefined, locale = DEFAULT_LOCALE): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return new Intl.NumberFormat(locale).format(value);
}

export function formatCurrency(value: number | null | undefined, locale = DEFAULT_LOCALE, currency = 'VND'): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '-';
  return `${formatNumber(value, locale)} ${currency}`;
}

export function formatDate(value: string | Date | null | undefined, locale = DEFAULT_LOCALE): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function formatDateTime(value: string | Date | null | undefined, locale = DEFAULT_LOCALE): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function formatShortDate(value: string | Date | null | undefined, locale = DEFAULT_LOCALE): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatLocation(...parts: Array<string | null | undefined>): string {
  const value = parts.filter((part): part is string => Boolean(part?.trim())).join(', ');
  return value || '-';
}

export function formatRemainingTime(value: string, now = Date.now()): string {
  const remaining = Math.max(0, new Date(value).getTime() - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':');
}

export function isWithinNextDay(value: string, now = Date.now()): boolean {
  const remaining = new Date(value).getTime() - now;
  return remaining > 0 && remaining <= 24 * 60 * 60 * 1000;
}
