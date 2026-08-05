import slugify from 'limax';
import { SITE, APP_BLOG } from '~/lib/config';
import { buildPermalink, BLOG_BASE, CATEGORY_BASE, TAG_BASE, trimSlash } from './paths';
import type { BuildPermalinkOptions } from './paths';

export { BLOG_BASE, CATEGORY_BASE, TAG_BASE };

export const POST_PERMALINK_PATTERN = trimSlash((APP_BLOG?.post?.permalink as string) ?? `${BLOG_BASE}/%slug%`);

export const getCanonical = (path = ''): string | URL => {
  const url = String(new URL(path, SITE.site));
  if (SITE.trailingSlash == false && path && url.endsWith('/')) {
    return url.slice(0, -1);
  } else if (SITE.trailingSlash == true && path && !url.endsWith('/')) {
    return url + '/';
  }
  return url;
};

export const getPermalink = (slug = '', type: BuildPermalinkOptions['type'] = 'page'): string => {
  return buildPermalink(slug, { type });
};

export const getHomePermalink = (): string => buildPermalink('/', { type: 'home' });

export const getBlogPermalink = (): string => buildPermalink(BLOG_BASE, { type: 'blog' });

export const getAsset = (path: string): string => buildPermalink(path, { type: 'asset' });

export const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/');

type MenuHref = { type?: BuildPermalinkOptions['type']; url?: string };

export const applyGetPermalinks = (menu: unknown = {}): unknown => {
  if (Array.isArray(menu)) {
    return menu.map((item) => applyGetPermalinks(item));
  } else if (typeof menu === 'object' && menu !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(menu)) {
      if (key === 'href') {
        if (typeof value === 'string') {
          result[key] = getPermalink(value);
        } else if (typeof value === 'object' && value !== null) {
          const href = value as MenuHref;
          if (href.type === 'home') {
            result[key] = getHomePermalink();
          } else if (href.type === 'blog') {
            result[key] = getBlogPermalink();
          } else if (href.type === 'asset') {
            result[key] = getAsset(href.url ?? '');
          } else if (href.url) {
            result[key] = getPermalink(href.url, href.type);
          }
        }
      } else {
        result[key] = applyGetPermalinks(value);
      }
    }
    return result;
  }
  return menu;
};

export const transitionName = (prefix: string, permalink: string): string =>
  `${prefix}-${String(permalink)
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
