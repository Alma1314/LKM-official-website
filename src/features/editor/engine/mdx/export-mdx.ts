import type { JSONContent } from '@tiptap/core';
import type { Root } from 'mdast';
import { tiptapToMdast } from './tiptap-to-mdast';
import { normalizeMDAST } from './normalize';
import { serializeMDAST } from './serialize-mdx';
import type { MdxExport } from './types';

export function exportMdx(editorContent: JSONContent[], frontmatter: Record<string, unknown> = {}): MdxExport {
  const root: Root = tiptapToMdast(editorContent);
  const normalized = normalizeMDAST(root);
  const mdx = serializeMDAST(normalized, frontmatter);
  return { frontmatter, mdx };
}
