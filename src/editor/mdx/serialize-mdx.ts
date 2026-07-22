import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import yaml from 'js-yaml';
import type { Root } from 'mdast';

const serializer = unified()
  .use(remarkStringify, {
    bullet: '-',
    emphasis: '_',
    strong: '*',
    resourceLink: false,
  })
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkMdx)
  .use(remarkGfm)
  .use(remarkMath, { singleDollarTextMath: true });

export function serializeMDAST(root: Root, frontmatter: Record<string, unknown>): string {
  const fmKeys = Object.keys(frontmatter);
  const tree: Root = { ...root, children: [...root.children] };

  if (fmKeys.length > 0) {
    const yamlStr = yaml.dump(frontmatter, { lineWidth: -1, quotingType: '"' });
    tree.children.unshift({
      type: 'yaml',
      value: yamlStr.replace(/\n$/, ''),
    });
  }

  return serializer.stringify(tree as Parameters<typeof serializer.stringify>[0]) as string;
}
