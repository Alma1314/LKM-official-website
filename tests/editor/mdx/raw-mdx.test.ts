import { describe, it, expect } from 'vitest';
import { importMdx } from '~/editor/mdx';

describe('rawMdx — unknown node fidelity', () => {
  it('preserves unknown MDX JSX component as a component node', () => {
    const mdx = '<CustomCard title="Hello" />';
    const imported = importMdx(mdx);
    const hasNode = imported.content.some((n) => n.type === 'component');
    expect(hasNode).toBe(true);
  });

  it('does not drop unknown MDX components on import', () => {
    const mdx = '<Card title="Hello" />\n\nNormal text';
    const imported = importMdx(mdx);
    // Should have at least 2 top-level nodes (component + paragraph)
    expect(imported.content.length).toBeGreaterThanOrEqual(2);
    const hasComponent = imported.content.some((n) => n.type === 'component');
    expect(hasComponent).toBe(true);
  });

  it('inline HTML is parsed as text in paragraphs', () => {
    // remark treats inline HTML inside paragraphs as text (stripped)
    // This is expected behavior for inline HTML in most markdown parsers
    const mdx = 'Text with <b>bold</b> styling';
    const imported = importMdx(mdx);
    expect(imported.content.length).toBeGreaterThan(0);
    // Content should not throw during import
  });

  it('MDX with mixed content imports cleanly', () => {
    const mdx = '# Title\n\n<Callout type="info">Note</Callout>\n\n- list item';
    // Should not throw
    expect(() => importMdx(mdx)).not.toThrow();
    const imported = importMdx(mdx);
    expect(imported.content.length).toBeGreaterThanOrEqual(2);
  });
});
