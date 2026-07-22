export interface ParsedMdx {
  frontmatter: Record<string, unknown>;
  root: import('mdast').Root;
}

export interface MdxExport {
  frontmatter: Record<string, unknown>;
  mdx: string;
}

export interface ValidationIssue {
  message: string;
  nodeType: string;
  severity: 'warning' | 'error';
  details?: string;
}
