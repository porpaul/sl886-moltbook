import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistance, parseISO, isValid } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const HONG_KONG_TZ = 'Asia/Hong_Kong';

/** Parse API date string; treat as UTC if no timezone suffix (so "X hours ago" is correct for HK). */
function toDate(date: string | Date | number): Date | null {
  if (date == null || date === '') return null;
  if (typeof date === 'number') {
    const ms = date > 1e12 ? date : date * 1000; // seconds vs milliseconds
    const d = new Date(ms);
    return isValid(d) ? d : null;
  }
  if (typeof date !== 'string') return isValid(date) ? date : null;
  let s = String(date).trim();
  if (!s) return null;
  // Unix timestamp (seconds or milliseconds)
  if (/^\d{10,13}$/.test(s)) {
    const ms = s.length <= 10 ? Number(s) * 1000 : Number(s);
    const d = new Date(ms);
    return isValid(d) ? d : null;
  }
  // SQLite/D1 often returns "YYYY-MM-DD HH:mm:ss" (space); parseISO expects ISO 8601 with "T"
  if (/^\d{4}-\d{2}-\d{2} \d/.test(s)) s = s.replace(' ', 'T');
  // If no Z or ±HHMM, assume UTC so relative time is correct for HK
  const hasTz = /Z$|[-+]\d{2}:?\d{2}$/.test(s);
  const iso = hasTz ? s : s.replace(/\.\d{3}$/, '') + 'Z';
  const d = parseISO(iso);
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

// Format relative time in Hong Kong timezone, Traditional Chinese (e.g. "約 3 小時前")
export function formatRelativeTime(date: string | Date): string {
  const d = toDate(date);
  if (!d) return '剛剛';
  const nowHK = toZonedTime(new Date(), HONG_KONG_TZ);
  const dateHK = toZonedTime(d, HONG_KONG_TZ);
  return formatDistance(dateHK, nowHK, { addSuffix: true, locale: zhTW });
}

// Format absolute date in Hong Kong timezone (safe: invalid/missing date → "—")
export function formatDate(date: string | Date): string {
  const d = toDate(date);
  return d ? formatInTimeZone(d, HONG_KONG_TZ, 'MMM d, yyyy') : '—';
}

// Format date and time in Hong Kong timezone (safe: invalid/missing date → "—")
export function formatDateTime(date: string | Date): string {
  const d = toDate(date);
  return d ? formatInTimeZone(d, HONG_KONG_TZ, 'MMM d, yyyy h:mm a') : '—';
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

/** Base path for the app (e.g. /moltbook); use for raw hrefs in HTML (e.g. stock-tag links) so they work under basePath. */
function getBasePath(): string {
  return (typeof process !== 'undefined' && (process.env.NEXT_PUBLIC_BASE_PATH as string)) || '';
}

export function getSubmoltUrl(name: string): string {
  return `/m/${name}`;
}

// Channel display overrides for canonical Traditional Chinese names.
export function getSubmoltDisplayName(name: string, fallback?: string | null): string {
  const normalized = String(name ?? '').trim().toLowerCase();
  if (normalized === 'stock_hk_00hsi') return '恒生指數';
  const text = String(fallback ?? '').trim();
  return text || String(name ?? '').trim();
}

// Normalize per-channel description text when backend still carries legacy labels.
export function getSubmoltDescription(name: string, description?: string | null): string {
  const normalized = String(name ?? '').trim().toLowerCase();
  const text = String(description ?? '').trim();
  if (!text) return '';
  if (normalized === 'stock_hk_00hsi') {
    return text.replaceAll('HK:00HSI', '恒生指數');
  }
  return text;
}

/**
 * Normalize a stock code to Moltbook submolt name (e.g. stock_hk_00100).
 * Accepts "0100.HK", "0883.HK", "100", "06603", "06603.HK".
 * Returns null if not a recognized HK code.
 */
export function stockCodeToSubmoltName(code: string): string | null {
  const raw = String(code ?? '').trim().toUpperCase().replace(/\s/g, '');
  const withoutSuffix = raw.replace(/\.HK$/, '');
  const digits = withoutSuffix.replace(/^0+/, '') || '0';
  if (!/^\d{1,5}$/.test(digits)) return null;
  const fiveDigit = digits.padStart(5, '0');
  return `stock_hk_${fiveDigit.toLowerCase()}`;
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

/** Normalize post/comment content so newlines display: turn literal backslash-n into real newlines. */
export function normalizePostContent(content: string | null | undefined): string {
  if (content == null || typeof content !== 'string') return '';
  return content.replace(/\\n/g, '\n');
}

const STOCK_TAG_PLACEHOLDER = '%%STOCKLINK%%';

/**
 * Replace in-content stock tags $NAME(CODE)$ or $CODE$ with placeholders; returns text and link HTML array.
 * Use so markdown (e.g. _italic_) does not corrupt underscores in /m/stock_hk_XXXXX hrefs.
 */
export function replaceStockTagsWithPlaceholders(text: string): { text: string; links: string[] } {
  const links: string[] = [];
  const out = text.replace(/\$([^$]+)\$/g, (_, inner) => {
    const trimmed = inner.trim();
    const parenMatch = trimmed.match(/^(.+?)\(([^)]+)\)\s*$/);
    let code: string;
    let display: string;
    if (parenMatch) {
      display = parenMatch[1].trim();
      code = parenMatch[2].trim();
    } else {
      code = trimmed;
      display = trimmed;
    }
    const submolt = stockCodeToSubmoltName(code);
    if (!submolt) return `$${inner}$`;
    const safeDisplay = display
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const base = getBasePath();
    const href = base ? `${base}/m/${submolt}` : `/m/${submolt}`;
    const html = `<a href="${href}" class="stock-tag">${safeDisplay}</a>`;
    const idx = links.length;
    links.push(html);
    return STOCK_TAG_PLACEHOLDER + idx + STOCK_TAG_PLACEHOLDER;
  });
  return { text: out, links };
}

/**
 * Substitute stock-tag placeholders (from replaceStockTagsWithPlaceholders) with link HTML.
 */
export function substituteStockTagPlaceholders(html: string, links: string[]): string {
  if (links.length === 0) return html;
  const re = new RegExp(STOCK_TAG_PLACEHOLDER + '(\\d+)' + STOCK_TAG_PLACEHOLDER, 'g');
  return html.replace(re, (_, i) => links[parseInt(i, 10)] ?? '');
}

/**
 * Replace in-content stock tags $NAME(CODE)$ or $CODE$ with <a> links to the stock channel.
 * Use when markdown/italic will not run (e.g. comments). For post body use replaceStockTagsWithPlaceholders + substituteStockTagPlaceholders so underscores in href are not turned into <em>.
 */
export function replaceStockTagsInContent(text: string): string {
  const { text: out, links } = replaceStockTagsWithPlaceholders(text);
  return substituteStockTagPlaceholders(out, links);
}

/** Escape HTML for safe insertion. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render comment content with newlines and in-content stock tags; safe for dangerouslySetInnerHTML.
 */
export function renderCommentContentWithStockTags(content: string | null | undefined): string {
  if (content == null || typeof content !== 'string') return '';
  const normalized = normalizePostContent(content);
  const escaped = escapeHtml(normalized).replace(/\n/g, '<br />');
  return replaceStockTagsInContent(escaped);
}
