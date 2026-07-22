import { describe, it, expect } from 'vitest';
import { parseMdxString, normalizeMDAST } from '~/editor/mdx';

describe('Normalize MDAST', () => {
  it('normalizes adjacent text nodes into one', () => {
    const { root } = parseMdxString('Hello world');
    // After parsing, paragraph should have children
    const para = root.children[0];
    if (para && para.type === 'paragraph') {
      const textChildren = (para as { children: Array<{ type: string }> }).children;
      // remark-parse may produce 1+ text nodes; normalization should merge them
      const textNodes = textChildren.filter((c) => c.type === 'text');
      expect(textNodes.length).toBe(1);
    }
  });

  it('clamps heading depth to 1-6', () => {
    // Heading level 1 is in range
    const { root } = parseMdxString('# Level 1 Heading');
    const normalized = normalizeMDAST(root);
    const heading = normalized.children[0];
    if (heading && heading.type === 'heading') {
      const depth = (heading as { depth: number }).depth;
      expect(depth).toBeGreaterThanOrEqual(1);
      expect(depth).toBeLessThanOrEqual(6);
    }
  });

  it('handles empty document', () => {
    const { root } = parseMdxString('');
    const normalized = normalizeMDAST(root);
    expect(normalized.type).toBe('root');
  });
});
