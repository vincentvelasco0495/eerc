import { CONFIG } from 'src/global-config';

/** Resolve API storage URLs for `<img src>` (handles relative `/storage/...`). */
export function resolveCmsMediaUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const base = (CONFIG.serverUrl ?? '').replace(/\/$/, '');
  if (!base) {
    return trimmed;
  }
  return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}
