import { describe, expect, it } from 'vitest';
import { detectLink, detectWiki, wikiHref } from '../markdown-shortcuts';

describe('detectLink', () => {
  it('命中闭合的 `[文字](url)`，返回正确 from/to/kind/href/label', () => {
    const text = '点击 [联想](https://x.com/a)';
    const r = detectLink(text);
    expect(r).not.toBeNull();
    expect(r!.kind).toBe('link');
    expect(r!.label).toBe('联想');
    expect(r!.href).toBe('https://x.com/a');
    expect(text.slice(r!.from, r!.to)).toBe('[联想](https://x.com/a)');
  });

  it('空 url 不命中，返回 null', () => {
    expect(detectLink('[文字]()')).toBeNull();
  });

  it('带 `!` 前缀的图片语法 `![alt](url)` 不应被误命中', () => {
    expect(detectLink('![图片](https://x.com/a.png)')).toBeNull();
  });

  it('未闭合（缺 `)`）返回 null', () => {
    expect(detectLink('[文字](https://x.com/a')).toBeNull();
  });
});

describe('detectWiki', () => {
  it('命中 `[[我的文档]]`，返回 kind=wiki 与 label', () => {
    const text = '参见 [[我的文档]]';
    const r = detectWiki(text);
    expect(r).not.toBeNull();
    expect(r!.kind).toBe('wiki');
    expect(r!.href).toBe('');
    expect(r!.label).toBe('我的文档');
    expect(text.slice(r!.from, r!.to)).toBe('[[我的文档]]');
  });

  it('空名 `[[]]` 返回 null', () => {
    expect(detectWiki('[[]]')).toBeNull();
  });

  it('未闭合（缺 `]]`）返回 null', () => {
    expect(detectWiki('[[我的文档')).toBeNull();
  });
});

describe('wikiHref', () => {
  const docs: () => Array<{ title: string; slug?: string }> = () => [
    { title: '快速上手', slug: 'quickstart' },
    { title: '无 slug 文档' },
    { title: '另一文档', slug: 'other' },
  ];

  it('命中已发布且含 slug 的文档，返回 /docs/<slug>', () => {
    expect(wikiHref('快速上手', docs)).toBe('/docs/quickstart');
  });

  it('标题匹配但无 slug，返回空串', () => {
    expect(wikiHref('无 slug 文档', docs)).toBe('');
  });

  it('无匹配文档，返回空串', () => {
    expect(wikiHref('不存在的文档', docs)).toBe('');
  });
});
