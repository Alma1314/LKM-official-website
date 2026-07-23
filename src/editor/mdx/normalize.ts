import type { Root } from 'mdast';

type Node = { type?: string; children?: Node[]; value?: string; depth?: number };

/**
 * Merge adjacent text nodes in paragraphs and headings.
 * remark-parse can produce multiple adjacent text nodes for the same inline content.
 */
function mergeTextChildren(children: Node[]): Node[] {
  const result: Node[] = [];

  for (const child of children) {
    const prev = result[result.length - 1];
    if (prev && prev.type === 'text' && child.type === 'text') {
      prev.value = (prev.value ?? '') + (child.value ?? '');
    } else {
      result.push(child);
    }
  }

  return result;
}

function walkNode(node: Node): void {
  if (Array.isArray(node.children)) {
    node.children = mergeTextChildren(node.children);
    for (const child of node.children) {
      walkNode(child);
    }
  }
}

/** Clamp heading depth to 1-6 */
function clampHeadingDepth(depth: number): number {
  return Math.max(1, Math.min(6, depth));
}

function walkAndClamp(node: Node): void {
  if (node.type === 'heading' && typeof node.depth === 'number') {
    node.depth = clampHeadingDepth(node.depth);
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkAndClamp(child);
    }
  }
}

export function normalizeMDAST(root: Root): Root {
  const cloned = JSON.parse(JSON.stringify(root)) as Root;
  walkNode(cloned as unknown as Node);
  walkAndClamp(cloned as unknown as Node);
  return cloned;
}
