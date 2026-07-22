import { describe, it, expect } from 'vitest';
import { importMdx, exportMdx, parseMdxString } from '~/editor/mdx';

describe('Frontmatter', () => {
  it('parses YAML frontmatter', () => {
    const mdx = ['---', 'title: Test', 'description: A test doc', '---', '', '# Hello'].join('\n');
    const result = parseMdxString(mdx);
    expect(result.frontmatter).toEqual({ title: 'Test', description: 'A test doc' });
  });

  it('round-trip preserves frontmatter', () => {
    const mdx = ['---', 'title: Round Trip', '---', '', 'Content here.'].join('\n');
    const imported = importMdx(mdx);
    expect(imported.frontmatter).toEqual({ title: 'Round Trip' });

    const exported = exportMdx(imported.content, imported.frontmatter);
    expect(exported.mdx).toContain('title: Round Trip');
    expect(exported.mdx).toContain('Content here.');
  });

  it('no frontmatter yields empty object', () => {
    const mdx = '# Just content';
    const result = parseMdxString(mdx);
    expect(result.frontmatter).toEqual({});
  });

  it('complex frontmatter survives round-trip', () => {
    const mdx = [
      '---',
      'title: Complex',
      'tags:',
      '  - astro',
      '  - tiptap',
      'author:',
      '  name: Alma',
      '  email: alma@example.com',
      '---',
      '',
      'Content.',
    ].join('\n');
    const imported = importMdx(mdx);
    const exported = exportMdx(imported.content, imported.frontmatter);
    expect(exported.mdx).toContain('title: Complex');
    expect(exported.mdx).toContain('astro');
    expect(exported.mdx).toContain('tiptap');
  });
});
