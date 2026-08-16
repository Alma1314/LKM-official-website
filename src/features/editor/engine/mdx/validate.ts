import type { ValidationIssue } from './types';
import { t } from '~/lib/i18n';

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

  // 检查禁止的节点类型（代码执行安全）
  if (nodeType === 'mdxjsEsm') {
    issues.push({
      message: t('editor.validation.esmForbidden'),
      nodeType: 'mdxjsEsm',
      severity: 'error',
    });
  }

  // 检查链接和图片的 URL 协议
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
          message: t('editor.validation.disallowedProtocol', { nodeType, url: node.url }),
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
