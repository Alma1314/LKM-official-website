import type { JSONContent } from '@tiptap/core';
import { parseMdxString } from './parse-mdx';
import { normalizeMDAST } from './normalize';
import { validateMDAST } from './validate';
import { mdastToTiptap } from './mdast-to-tiptap';
import type { ParsedMdx, ValidationIssue } from './types';

export interface ImportResult {
  content: JSONContent[];
  frontmatter: Record<string, unknown>;
  issues: ValidationIssue[];
}

export function importMdx(mdx: string): ImportResult {
  const parsed: ParsedMdx = parseMdxString(mdx);
  const normalized = normalizeMDAST(parsed.root);
  const issues = validateMDAST(normalized);

  const hasErrors = issues.some((i) => i.severity === 'error');
  if (hasErrors) {
    throw Object.assign(
      new Error(
        'MDX contains security issues: ' +
          issues
            .filter((i) => i.severity === 'error')
            .map((i) => i.message)
            .join('; ')
      ),
      { issues }
    );
  }

  const content = mdastToTiptap(normalized);
  return { content, frontmatter: parsed.frontmatter, issues };
}
