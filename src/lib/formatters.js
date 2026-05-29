import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const toDate = (input) =>
  typeof input === 'string' ? parseISO(input) : input instanceof Date ? input : new Date(input);

/** formatRupiah(1500000) -> "Rp 1.500.000" */
export function formatRupiah(amount) {
  const value = Number.isFinite(amount) ? Math.round(amount) : 0;
  return `Rp ${value.toLocaleString('id-ID')}`;
}

/** formatRupiahShort(1500000) -> "1,5jt" ; (500000) -> "500rb" */
export function formatRupiahShort(amount) {
  const value = Number.isFinite(amount) ? amount : 0;
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000;
    const str = (Math.round(v * 10) / 10).toString().replace('.', ',');
    return `${sign}${str}jt`;
  }
  if (abs >= 1_000) {
    return `${sign}${Math.round(abs / 1_000)}rb`;
  }
  return `${sign}${abs}`;
}

/** formatDate(iso) -> "Senin, 27 Jan 2025" */
export function formatDate(input) {
  return format(toDate(input), 'EEEE, d MMM yyyy', { locale: id });
}

/** formatTime("14:30") or ISO -> "14:30" */
export function formatTime(input) {
  if (typeof input === 'string' && /^\d{1,2}:\d{2}$/.test(input)) {
    const [h, m] = input.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }
  return format(toDate(input), 'HH:mm');
}

/** getMealTime("08:30") -> 'pagi' | 'siang' | 'sore' | 'malam' */
export function getMealTime(timeString) {
  const [h] = (timeString || '00:00').split(':').map(Number);
  if (h < 10) return 'pagi';
  if (h < 15) return 'siang';
  if (h < 18) return 'sore';
  return 'malam';
}

/** getMonthYear(iso) -> "Januari 2025" */
export function getMonthYear(input) {
  return format(toDate(input), 'MMMM yyyy', { locale: id });
}

/** getDayLabel(iso) -> "Hari ini" | "Kemarin" | "Senin, 27 Jan" */
export function getDayLabel(input) {
  const d = toDate(input);
  if (isToday(d)) return 'Hari ini';
  if (isYesterday(d)) return 'Kemarin';
  return format(d, 'EEEE, d MMM', { locale: id });
}

/** Capitalize first letter (greetings etc.) */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
