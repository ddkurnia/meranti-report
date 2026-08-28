import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import slugify from 'slugify';
import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'id',
  });
}

/**
 * Convert any date-like value to a JavaScript Date.
 * Handles: ISO strings, native Date, Firestore Timestamp (.toDate()),
 * serialized Timestamp {seconds, nanoseconds}, and null/undefined.
 */
export function toDate(value: Date | string | null | undefined | { toDate?: () => Date; seconds?: number; nanoseconds?: number }): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp object (has .toDate method)
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    try { return value.toDate(); } catch { return null; }
  }
  // Serialized Firestore Timestamp {seconds, nanoseconds}
  if (typeof value === 'object' && 'seconds' in value) {
    const ms = ((value.seconds || 0) * 1000) + Math.floor((value.nanoseconds || 0) / 1000000);
    return new Date(ms);
  }
  return null;
}

export function formatDate(date: Date | string | null | undefined | any): string {
  const d = toDate(date);
  if (!d) return '';
  return format(d, 'dd MMMM yyyy, HH:mm', { locale: id });
}

export function formatDateShort(date: Date | string | null | undefined | any): string {
  const d = toDate(date);
  if (!d) return '';
  return format(d, 'dd MMM yyyy', { locale: id });
}

export function formatRelativeDate(date: Date | string | null | undefined | any): string {
  const d = toDate(date);
  if (!d) return '';
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

/**
 * Convert any date-like value to an ISO string. Safe for JSON-LD, API responses, etc.
 */
export function toISOString(date: Date | string | null | undefined | any): string | null {
  const d = toDate(date);
  return d ? d.toISOString() : null;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

export function getReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function extractPublicIdFromUrl(url: string): string {
  if (!url) return '';
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : '';
}
