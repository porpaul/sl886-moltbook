import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, parseISO, isValid } from 'date-fns';

function toDate(date: string | Date): Date | null {
  if (date == null || date === '') return null;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? d : null;
}

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format score (e.g., 1.2K, 3.5M). Safe for undefined/null.
export function formatScore(score: number | null | undefined): string {
  const n = score == null || Number.isNaN(Number(score)) ? 0 : Number(score);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1000) return sign + (abs / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

// Format relative time (safe: invalid/missing date → "recently")
export function formatRelativeTime(date: string | Date): string {
  const d = toDate(date);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : 'recently';
}

// Format absolute date (safe: invalid/missing date → "—")
export function formatDate(date: string | Date): string {
  const d = toDate(date);
  return d ? format(d, 'MMM d, yyyy') : '—';
}

// Format date and time (safe: invalid/missing date → "—")
export function formatDateTime(date: string | Date): string {
  const d = toDate(date);
  return d ? format(d, 'MMM d, yyyy h:mm a') : '—';
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + '...';
}

// Extract domain from URL
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Validate agent name
export function isValidAgentName(name: string): boolean {
  return /^[a-z0-9_]{2,32}$/i.test(name);
}

// Validate submolt name
export function isValidSubmoltName(name: string): boolean {
  return /^[a-z0-9_]{2,24}$/i.test(name);
}

// Validate API key (unified prefix: moltbook_ or sl886_agent_)
export function isValidApiKey(key: string): boolean {
  return /^moltbook_[a-zA-Z0-9]{20,}$/.test(key) || /^sl886_agent_[a-zA-Z0-9]{20,}$/.test(key);
}

// Generate initials from name (safe for undefined/null/empty)
export function getInitials(name: string | null | undefined): string {
  if (name == null || String(name).trim() === '') return '?';
  return String(name).split(/[\s_]+/).map(part => part[0]?.toUpperCase()).filter(Boolean).slice(0, 2).join('') || '?';
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || singular + 's');
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
export function throttle<T extends (...args: unknown[]) => unknown>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Sleep
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Local storage helpers
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}

// URL helpers
/** Post detail is always at /post/[id]; no /m/[name]/post/[id] route exists. */
export function getPostUrl(postId: string, _submolt?: string): string {
  return `/post/${postId}`;
}

/** Full URL for sharing a post (uses current origin and base path when in browser). */
export function getPostShareUrl(postId: string): string {
  if (typeof window === 'undefined') return '';
  const base = (process.env.NEXT_PUBLIC_BASE_PATH as string) || '';
  return `${window.location.origin}${base}/post/${postId}`;
}

export function getSubmoltUrl(name: string): string {
  return `/m/${name}`;
}

export function getAgentUrl(name: string): string {
  return `/u/${name}`;
}

// Scroll helpers
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToElement(id: string): void {
  const element = document.getElementById(id);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Keyboard event helpers
export function isEnterKey(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return event.key === 'Enter' && !event.shiftKey;
}

export function isEscapeKey(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return event.key === 'Escape';
}

// Random string
export function randomId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
