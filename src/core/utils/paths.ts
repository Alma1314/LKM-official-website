import { SITE, APP_BLOG } from '~/core/config';
import { trim } from './utils';

// ── 内部 helpers ──

export const trimSlash = (s: string) => trim(trim(s, '/'), '/');

// ── 纯字符串拼接 ──

export function joinPaths(...parts: string[]): string {
  const joined = parts.join('/');
  return joined.replace(/\/+/g, '/');
}

// ── Web URL 拼接（编译时 BASE_URL） ──

export function buildUrl(path: string): string {
  return joinPaths('', import.meta.env.BASE_URL, path);
}

// ── Permalink 拼接 ──

const BASE_PATHNAME = SITE.base || '/';

export const BLOG_BASE = trimSlash(
  (APP_BLOG?.list?.pathname as string) ?? 'blog'
);
export const CATEGORY_BASE = trimSlash(
  (APP_BLOG?.category?.pathname as string) ?? 'category'
);
export const TAG_BASE = trimSlash(
  (APP_BLOG?.tag?.pathname as string) ?? 'tag'
);

export interface BuildPermalinkOptions {
  type?: 'page' | 'post' | 'category' | 'tag' | 'asset' | 'blog' | 'home';
  trailingSlash?: boolean;
}

export function buildPermalink(
  slug: string,
  options: BuildPermalinkOptions = {}
): string {
  const { type = 'page', trailingSlash } = options;
  const useTrailingSlash = trailingSlash ?? SITE.trailingSlash ?? false;

  if (slug.startsWith('https://') || slug.startsWith('http://') || slug.startsWith('://')) {
    return slug;
  }
  if (slug.startsWith('#') || slug.startsWith('javascript:')) {
    return slug;
  }

  const hashIndex = slug.indexOf('#');
  if (hashIndex > 0) {
    const pathPart = slug.substring(0, hashIndex);
    const hashPart = slug.substring(hashIndex);
    return buildPermalink(pathPart, { type, trailingSlash }) + hashPart;
  }

  let path: string;
  switch (type) {
    case 'home':
      path = '/';
      break;
    case 'blog':
      path = BLOG_BASE;
      break;
    case 'asset': {
      const parts = [BASE_PATHNAME, slug]
        .map((el) => trimSlash(el))
        .filter((el) => !!el);
      return '/' + parts.join('/');
    }
    case 'category':
      path = joinPaths(CATEGORY_BASE, trimSlash(slug));
      break;
    case 'tag':
      path = joinPaths(TAG_BASE, trimSlash(slug));
      break;
    case 'post':
      path = trimSlash(slug);
      break;
    case 'page':
    default:
      path = slug;
      break;
  }

  const segments = [BASE_PATHNAME, path]
    .map((el) => trimSlash(el))
    .filter((el) => !!el);
  const result = '/' + segments.join('/');

  if (useTrailingSlash && result !== '/') {
    return result.endsWith('/') ? result : result + '/';
  }
  if (!useTrailingSlash && result.endsWith('/') && result !== '/') {
    return result.slice(0, -1);
  }
  return result;
}

// ── 图片 glob 路径 ──

export function getImageGlobBasePath(basePath: string, src: string): string {
  const joined = joinPaths(basePath, src);
  return joined.replace(/\\/g, '/');
}

export function getPostImageBasePath(entryId: string): string {
  const lastSlashIndex = entryId.lastIndexOf('/');
  const dir = lastSlashIndex < 0 ? '/' : entryId.substring(0, lastSlashIndex + 1);
  return joinPaths('content/posts/', dir);
}

// ── Auth 运行时路径拼接 ──

/**
 * 使用运行时的 base（window.__BASE_URL__）拼接路径。
 * 适用于 Vue/Svelte 客户端组件，因为编译时 import.meta.env.BASE_URL 不可靠。
 */
export function buildAuthUrl(base: string, path: string): string {
  if (!path) return base.replace(/\/$/, '') || '/';
  return joinPaths(base, path);
}
