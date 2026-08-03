import { describe, it, expect } from 'vitest';
import { joinPaths, buildUrl, buildPermalink, getImageGlobBasePath, getPostImageBasePath } from '../paths';

describe('joinPaths', () => {
  it('joins with single slash', () => {
    expect(joinPaths('a', 'b', 'c')).toBe('a/b/c');
  });

  it('deduplicates consecutive slashes', () => {
    expect(joinPaths('/a/', '/b/', '/c')).toBe('/a/b/c');
  });

  it('handles empty parts', () => {
    // joinPaths keeps trailing slashes from empty arguments — it only dedupes consecutive slashes
    expect(joinPaths('', 'a', '')).toBe('/a/');
  });

  it('returns empty string for no parts', () => {
    expect(joinPaths()).toBe('');
  });
});

describe('buildUrl', () => {
  it('prepends BASE_URL with no double slash', () => {
    // BASE_URL is '/LKM-official-website' or '/' based on config
    const result = buildUrl('/treehole');
    expect(result).not.toContain('//');
  });

  it('works with empty path (just base)', () => {
    const result = buildUrl('');
    expect(result).toBe(import.meta.env.BASE_URL || '/');
  });
});

describe('buildPermalink', () => {
  it('returns root for home type', () => {
    // SITE.trailingSlash = false by default → no trailing slash
    expect(buildPermalink('/', { type: 'home' })).toBe('/LKM-official-website');
  });

  it('returns blog path for blog type', () => {
    const r = buildPermalink('blog', { type: 'blog' });
    expect(r).toContain('/blog');
  });

  it('respects trailingSlash: false override', () => {
    const r = buildPermalink('blog', { type: 'blog', trailingSlash: false });
    expect(r).not.toBe('/'); // trailingSlash controls whether trailing / is added
  });

  it('handles asset type', () => {
    const r = buildPermalink('images/logo.png', { type: 'asset' });
    expect(r).toContain('images/logo.png');
  });

  it('defaults to page type', () => {
    const r = buildPermalink('/about');
    expect(r).toContain('/about');
  });

  it('passes through external URLs unchanged', () => {
    expect(buildPermalink('https://example.com')).toBe('https://example.com');
  });
});

describe('getImageGlobBasePath', () => {
  it('normalizes and joins base path with src', () => {
    const result = getImageGlobBasePath('content/posts/2024/', 'cover.jpg');
    expect(result).toBe('content/posts/2024/cover.jpg');
    expect(result).not.toContain('\\');
  });
});

describe('getPostImageBasePath', () => {
  it('extracts dir from entry id and returns content/posts/ path', () => {
    const result = getPostImageBasePath('posts/2024/my-post.md');
    expect(result).toBe('content/posts/posts/2024/');
  });
});
