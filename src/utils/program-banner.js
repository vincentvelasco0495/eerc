import { CONFIG } from 'src/global-config';

/** Resolve `programs.banner_path` / API `bannerPath` to a browser-loadable URL. */
export function resolveProgramBannerSrc(value) {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return '';
  }
  if (/^(https?:\/\/|blob:|data:)/i.test(raw)) {
    return raw;
  }

  const configured = String(CONFIG.serverUrl ?? '').trim();
  const fallback =
    typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.hostname}:8000`
      : '';
  const origin = configured || fallback;
  if (!origin) {
    return raw;
  }

  if (raw.startsWith('/')) {
    return `${origin.replace(/\/$/, '')}${raw}`;
  }

  return `${origin.replace(/\/$/, '')}/storage/${raw.replace(/^\/+/, '')}`;
}
