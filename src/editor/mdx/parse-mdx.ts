import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import yaml from 'js-yaml';
import type { Root } from 'mdast';
import type { ParsedMdx } from './types';

const parser = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm)
  .use(remarkMath, { singleDollarTextMath: true })
  .use(remarkMdx);

export function parseMdxString(mdx: string): ParsedMdx {
  const root = parser.parse(mdx) as Root;
  let frontmatter: Record<string, unknown> = {};

  // Extract and remove YAML frontmatter from the tree
  const firstChild = root.children[0];
  if (firstChild?.type === 'yaml') {
    try {
      const parsed = yaml.load(firstChild.value) as Record<string, unknown> | undefined;
      if (parsed && typeof parsed === 'object') {
        frontmatter = parsed;
      }
    } catch {
      // Ignore invalid YAML, keep empty frontmatter
    }
    root.children = root.children.slice(1);
  }

  return { frontmatter, root };
}
