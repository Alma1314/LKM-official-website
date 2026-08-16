import type { Root } from "mdast";

type Node = {
  type?: string;
  children?: Node[];
  value?: string;
  depth?: number;
};

/**
 * 合并段落和标题中相邻的文本节点。
 * remark-parse 可能为同一内联内容生成多个相邻文本节点。
 */
function mergeTextChildren(children: Node[]): Node[] {
  const result: Node[] = [];

  for (const child of children) {
    const prev = result[result.length - 1];
    if (prev && prev.type === "text" && child.type === "text") {
      prev.value = (prev.value ?? "") + (child.value ?? "");
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

/** 限制标题深度为 1-6 */
function clampHeadingDepth(depth: number): number {
  return Math.max(1, Math.min(6, depth));
}

function walkAndClamp(node: Node): void {
  if (node.type === "heading" && typeof node.depth === "number") {
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
