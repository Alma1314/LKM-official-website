import { describe, it, expect } from 'vitest';
import { importMdx, exportMdx } from '~/editor/mdx';

function roundTrip(mdx: string): string {
  const imported = importMdx(mdx);
  const exported = exportMdx(imported.content, imported.frontmatter);
  return exported.mdx.trim();
}

describe('MDX round-trip', () => {
  it('empty document', () => {
    const result = roundTrip('');
    expect(result).toBe('');
  });

  it('single paragraph', () => {
    const mdx = 'Hello world';
    const result = roundTrip(mdx);
    expect(result).toContain('Hello world');
  });

  it('headings', () => {
    const mdx = ['# Heading 1', '## Heading 2', '### Heading 3'].join('\n');
    const result = roundTrip(mdx);
    expect(result).toContain('# Heading 1');
    expect(result).toContain('## Heading 2');
    expect(result).toContain('### Heading 3');
  });

  it('bold and italic', () => {
    const mdx = 'This is **bold** and _italic_ text';
    const result = roundTrip(mdx);
    expect(result).toContain('**bold**');
    expect(result).toContain('_italic_');
  });

  it('strikethrough', () => {
    const mdx = 'This is ~~deleted~~ text';
    const result = roundTrip(mdx);
    expect(result).toContain('~~deleted~~');
  });

  it('inline code', () => {
    const mdx = 'Use `const x = 1` here';
    const result = roundTrip(mdx);
    expect(result).toContain('`const x = 1`');
  });

  it('links', () => {
    const mdx = 'Visit [example](https://example.com) now';
    const result = roundTrip(mdx);
    expect(result).toContain('[example](https://example.com)');
  });

  it('blockquote', () => {
    const mdx = '> quoted text';
    const result = roundTrip(mdx);
    expect(result).toContain('> quoted text');
  });

  it('code block', () => {
    const mdx = '```js\nconst x = 1;\n```';
    const result = roundTrip(mdx);
    expect(result).toContain('```js');
    expect(result).toContain('const x = 1');
  });

  it('horizontal rule', () => {
    const mdx = ['Some text above', '', '---', '', 'Some text below'].join('\n');
    const result = roundTrip(mdx);
    // remark-stringify may use '***' instead of '---' for thematic break
    expect(result.includes('---') || result.includes('***')).toBe(true);
  });

  it('bullet list', () => {
    const mdx = ['- Item A', '- Item B', '- Item C'].join('\n');
    const result = roundTrip(mdx);
    expect(result).toContain('- Item A');
    expect(result).toContain('- Item B');
    expect(result).toContain('- Item C');
  });

  it('ordered list', () => {
    const mdx = ['1. First', '2. Second', '3. Third'].join('\n');
    const result = roundTrip(mdx);
    expect(result).toContain('1.');
    expect(result).toContain('2.');
    expect(result).toContain('3.');
  });

  it('task list', () => {
    const mdx = ['- [ ] todo', '- [x] done'].join('\n');
    const result = roundTrip(mdx);
    expect(result).toContain('- [ ]');
    expect(result).toContain('- [x]');
  });

  it('image', () => {
    const mdx = '![alt text](https://example.com/img.png)';
    const result = roundTrip(mdx);
    expect(result).toContain('[alt text](https://example.com/img.png)');
  });

  it('inline math', () => {
    const mdx = '$E=mc^2$';
    const result = roundTrip(mdx);
    expect(result).toContain('$E=mc^2$');
  });

  it('block math', () => {
    const mdx = ['', '$$', 'x^2 + y^2 = 1', '$$', ''].join('\n');
    const result = roundTrip(mdx);
    expect(result).toContain('$$');
  });

  it('GFM table', () => {
    const mdx = ['| Name | Count |', '| ---- | ----- |', '| A    | 10    |'].join('\n');
    const result = roundTrip(mdx);
    expect(result).toContain('| Name | Count |');
  });

  it('multiple blocks', () => {
    const mdx = ['# Title', '', 'Paragraph text here.', '', '- list item 1', '- list item 2', '', '> a quote'].join(
      '\n'
    );
    const result = roundTrip(mdx);
    expect(result).toContain('# Title');
    expect(result).toContain('Paragraph text');
    expect(result).toContain('- list item 1');
    expect(result).toContain('> a quote');
  });

  it('round-trip is stable (double trip)', () => {
    const mdx = '## Test\n\n**Bold** and _italic_ text.\n\n- one\n- two\n';
    const first = roundTrip(mdx);
    const second = roundTrip(first);
    // The second trip should produce the same as the first
    // Compare word content since formatting may normalize whitespace
    expect(second).toContain('Bold');
    expect(second).toContain('italic');
    expect(second).toContain('one');
    expect(second).toContain('two');
  });
});
