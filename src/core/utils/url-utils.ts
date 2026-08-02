import I18nKey from '~/core/i18n/i18nKey';
import { i18n } from '~/core/i18n/translation';
import { buildUrl } from './paths';

export function pathsEqual(path1: string, path2: string) {
  const normalizedPath1 = path1.replace(/^\/|\/$/g, '').toLowerCase();
  const normalizedPath2 = path2.replace(/^\/|\/$/g, '').toLowerCase();
  return normalizedPath1 === normalizedPath2;
}

export function getPostUrlBySlug(slug: string): string {
  return buildUrl(`/official/article/posts/${slug}/`);
}

export function getTagUrl(tag: string): string {
  if (!tag) return buildUrl('/official/article/archive/');
  return buildUrl(`/official/article/archive/?tag=${encodeURIComponent(tag.trim())}`);
}

export function getCategoryUrl(category: string | null): string {
  if (
    !category ||
    category.trim() === '' ||
    category.trim().toLowerCase() === i18n(I18nKey.uncategorized).toLowerCase()
  )
    return buildUrl('/official/article/archive/?uncategorized=true');
  return buildUrl(`/official/article/archive/?category=${encodeURIComponent(category.trim())}`);
}

export function getDir(path: string): string {
  const lastSlashIndex = path.lastIndexOf('/');
  if (lastSlashIndex < 0) {
    return '/';
  }
  return path.substring(0, lastSlashIndex + 1);
}

export function url(path: string) {
  return buildUrl(path);
}
