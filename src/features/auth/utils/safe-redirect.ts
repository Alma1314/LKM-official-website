const rejectPattern = /^(javascript:|https?:|data:|blob:|mailto:|\/\/|\\)/i;

export function resolveSafeRedirect(raw: string | null | undefined): string {
  if (!raw) return '/';
  const candidate = raw.trim();
  if (!candidate || candidate === '/') return '/';
  if (rejectPattern.test(candidate)) return '/';
  const base = getBase();
  const normalized = candidate.startsWith('/') ? candidate : `/${candidate}`;
  if (base && base !== '/' && base !== normalized && !normalized.startsWith(base)) {
    return '/';
  }
  return normalized;
}

function getBase(): string {
  if (typeof window !== 'undefined') {
    return String((window as unknown as { __BASE_URL__?: string }).__BASE_URL__ ?? '/');
  }
  return '/';
}
