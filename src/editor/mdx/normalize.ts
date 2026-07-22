import type { Root, Content } from 'mdast';

/**
 * Merge adjacent text nodes in paragraphs and headings.
 * remark-parse can produce multiple adjacent text nodes for the same inline content.
 */
function mergeTextChildren(children: Content[]): Content[] {
  if (!Array.isArray(children)) return children;
  const result: Content[] = [];

  for (const child of children) {
    const prev = result[result.length - 1];
    if (prev && prev.type === 'text' && child.type === 'text') {
      (prev as { value: string }).value += (child as { value: string }).value;
    } else {
      result.push(child);
    }
  }

  return result;
}

function walkNode(node: unknown): void {
  const n = node as { type?: string; children?: Content[] };
  if (!n || typeof n !== 'object') return;

  if (Array.isArray(n.children)) {
    n.children = mergeTextChildren(n.children);
    for (const child of n.children) {
      walkNode(child);
    }
  }
}

/** Clamp heading depth to 1-6 */
function clampHeadingDepth(depth: number): number {
  return Math.max(1, Math.min(6, depth));
}

function walkAndClamp(node: unknown): void {
  const n = node as { type?: string; depth?: number; children?: Content[] };
  if (!n || typeof n !== 'object') return;

  if (n.type === 'heading' && typeof n.depth === 'number') {
    n.depth = clampHeadingDepth(n.depth);
  }

  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      walkAndClamp(child);
    }
  }
}

export function normalizeMDAST(root: Root): Root {
  const cloned = JSON.parse(JSON.stringify(root)) as Root;
  walkNode(cloned);
  walkAndClamp(cloned);
  return cloned;
}
