import type { ValidationIssue } from './types';

const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:'];

interface WalkableNode {
  type?: string;
  children?: WalkableNode[];
  url?: string;
  value?: string;
}

function walkTree(node: WalkableNode, issues: ValidationIssue[]): void {
  if (!node || typeof node !== 'object') return;

  const nodeType = node.type ?? 'unknown';

  // Check for forbidden node types (code execution)
  if (nodeType === 'mdxjsEsm') {
    issues.push({
      message: 'MDX ESM imports/exports are not allowed for security',
      nodeType: 'mdxjsEsm',
      severity: 'error',
    });
  }

  // Check URL protocols on links and images
  if ((nodeType === 'link' || nodeType === 'image') && node.url) {
    if (node.url.includes(':')) {
      const proto = node.url.split(':')[0] + ':';
      if (
        !ALLOWED_PROTOCOLS.includes(proto) &&
        !node.url.startsWith('/') &&
        !node.url.startsWith('.') &&
        !node.url.startsWith('#')
      ) {
        issues.push({
          message: `Disallowed URL protocol in ${nodeType}: ${node.url}`,
          nodeType,
          severity: 'warning',
          details: node.url,
        });
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkTree(child, issues);
    }
  }
}

export function validateMDAST(root: WalkableNode): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  walkTree(root, issues);
  return issues;
}
