import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { dfLocale, getLang, translate } from '../i18n';

const toDate = (input) =>
  typeof input === 'string' ? parseISO(input) : input instanceof Date ? input : new Date(input);

/** formatRupiah(1500000) -> "Rp 1.500.000" (currency is always IDR) */
export function formatRupiah(amount) {
  const value = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

/** formatRupiahShort(1500000) -> "1,5jt" (id) / "1.5M" (en) */
export function formatRupiahShort(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const en = getLang() === 'en';
  if (abs >= 1_000_000) {
    const v = Math.round((abs / 1_000_000) * 10) / 10;
    return `${sign}${en ? v.toString() : v.toString().replace('.', ',')}${en ? 'M' : 'jt'}`;
  }
  if (abs >= 1_000) {
    return `${sign}${Math.round(abs / 1_000)}${en ? 'k' : 'rb'}`;
  }
  return `${sign}${abs}`;
}

/** formatDate(iso) -> localized "Senin, 27 Jan 2025" / "Monday, 27 Jan 2025" */
export function formatDate(input) {
  return format(toDate(input), 'EEEE, d MMM yyyy', { locale: dfLocale() });
}

/** formatTime("14:30") or ISO -> "14:30" */
export function formatTime(input) {
  if (typeof input === 'string' && /^\d{1,2}:\d{2}$/.test(input)) {
    const [h, m] = input.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  return format(toDate(input), 'HH:mm');
}

/** getMealTime("08:30") -> 'pagi' | 'siang' | 'sore' | 'malam' (internal key) */
export function getMealTime(timeString) {
  const [h] = (timeString || '00:00').split(':').map(Number);
  if (h < 10) return 'pagi';
  if (h < 15) return 'siang';
  if (h < 18) return 'sore';
  return 'malam';
}

/** getMonthYear(iso) -> localized "Januari 2025" / "January 2025" */
export function getMonthYear(input) {
  return format(toDate(input), 'MMMM yyyy', { locale: dfLocale() });
}

/** getDayLabel(iso) -> "Hari ini"/"Today" | "Kemarin"/"Yesterday" | localized weekday */
export function getDayLabel(input) {
  const d = toDate(input);
  if (isToday(d)) return translate('date.today');
  if (isYesterday(d)) return translate('date.yesterday');
  return format(d, 'EEEE, d MMM', { locale: dfLocale() });
}

/** Capitalize first letter (greetings etc.) */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
