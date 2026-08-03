import type { Root, RootContent, PhrasingContent } from 'mdast';
import type { JSONContent } from '@tiptap/core';

/** 将 Tiptap JSON 内容数组转换回 MDAST Root 树。 */
export function tiptapToMdast(nodes: JSONContent[]): Root {
  const tree: Root = {
    type: 'root',
    children: convertBlocks(nodes),
  };
  return tree;
}

function convertBlocks(nodes: JSONContent[]): RootContent[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = [];

  for (const node of nodes) {
    if (!node.type) continue;

    switch (node.type) {
      case 'paragraph':
        result.push({
          type: 'paragraph',
          children: convertInline(node.content ?? []),
        });
        break;
      case 'heading':
        result.push({
          type: 'heading',
          depth: Math.max(1, Math.min(6, (node.attrs as Record<string, number> | undefined)?.level ?? 1)) as
            1 | 2 | 3 | 4 | 5 | 6,
          children: convertInline(node.content ?? []),
        } as RootContent);
        break;
      case 'blockquote':
        result.push({
          type: 'blockquote',
          children: convertBlocks(node.content ?? []) as RootContent[],
        } as RootContent);
        break;
      case 'codeBlock': {
        const lang = (node.attrs as Record<string, string> | undefined)?.language ?? '';
        const text = node.content?.[0]?.text ?? '';
        result.push({
          type: 'code',
          lang: lang || null,
          meta: null,
          value: text,
        });
        break;
      }
      case 'horizontalRule':
        result.push({ type: 'thematicBreak' });
        break;
      case 'bulletList':
      case 'orderedList':
        result.push({
          type: 'list',
          ordered: node.type === 'orderedList',
          start: (node.attrs as Record<string, number> | undefined)?.start ?? 1,
          spread: false,
          children: (node.content ?? []).map(convertListItem),
        } as RootContent);
        break;
      case 'taskList':
        result.push({
          type: 'list',
          ordered: false,
          start: 1,
          spread: false,
          children: (node.content ?? []).map(convertListItem),
        } as RootContent);
        break;
      case 'table': {
        const rows = (node.content ?? []).map((row) => ({
          type: 'tableRow' as const,
          children: (row.content ?? []).map((cell) => ({
            type: 'tableCell' as const,
            children: convertBlocks(cell.content ?? []),
          })),
        }));
        result.push({ type: 'table', children: rows } as RootContent);
        break;
      }
      case 'blockMath':
        result.push({
          type: 'math',
          value: (node.attrs as Record<string, string> | undefined)?.latex ?? '',
        } as RootContent);
        break;
      case 'image': {
        const attrs = (node.attrs ?? {}) as Record<string, string>;
        result.push({
          type: 'image',
          url: attrs.src ?? '',
          alt: attrs.alt ?? '',
          title: attrs.title || null,
        } as RootContent);
        break;
      }
      case 'callout': {
        const attrs = (node.attrs ?? {}) as Record<string, unknown>;
        const attrStr = Object.entries(attrs)
          .filter(([, v]) => v !== '' && v !== undefined && v !== null)
          .map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : `${k}={${v}}`))
          .join(' ');
        result.push({
          type: 'html',
          value: `<Callout${attrStr ? ' ' + attrStr : ''} />`,
        } as RootContent);
        break;
      }
      case 'figure': {
        const attrs = (node.attrs ?? {}) as Record<string, unknown>;
        const attrStr = Object.entries(attrs)
          .filter(([, v]) => v !== '' && v !== undefined && v !== null)
          .map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : `${k}={${v}}`))
          .join(' ');
        result.push({
          type: 'html',
          value: `<Figure${attrStr ? ' ' + attrStr : ''} />`,
        } as RootContent);
        break;
      }
      case 'component':
      case 'inlineComponent': {
        const attrs = (node.attrs ?? {}) as Record<string, unknown>;
        const source = typeof attrs.source === 'string' ? attrs.source : '';
        if (source) {
          result.push({
            type: 'html',
            value: source,
          } as RootContent);
        }
        break;
      }
      case 'rawMdx': {
        const attrs = (node.attrs ?? {}) as Record<string, string>;
        result.push({
          type: 'html',
          value: attrs.source ?? '',
        } as RootContent);
        break;
      }
      default:
        // 未知块 → 原始 HTML 透传
        break;
    }
  }

  return result;
}

// 内联转换的类型辅助（wrapWithMark 中使用）
interface MdastTextNode {
  type: 'text';
  value: string;
}

function convertListItem(node: JSONContent): RootContent {
  if (node.type === 'taskItem') {
    return {
      type: 'listItem',
      checked: (node.attrs as Record<string, boolean> | undefined)?.checked ?? false,
      spread: false,
      children: convertBlocks(node.content ?? []),
    } as RootContent;
  }
  return {
    type: 'listItem',
    spread: false,
    children: convertBlocks(node.content ?? []),
  } as RootContent;
}

/** 将 Tiptap mark 转换为 MDAST 包装节点 */
function wrapWithMark(
  content: PhrasingContent[],
  markType: string,
  markAttrs?: Record<string, unknown>
): PhrasingContent[] {
  switch (markType) {
    case 'bold':
      return [{ type: 'strong', children: content } as PhrasingContent];
    case 'italic':
      return [{ type: 'emphasis', children: content } as PhrasingContent];
    case 'strike':
      return [{ type: 'delete', children: content } as PhrasingContent];
    case 'code':
      // inlineCode is a leaf, extract text
      if (content.length === 1 && content[0].type === 'text') {
        return [{ type: 'inlineCode', value: (content[0] as MdastTextNode).value } as PhrasingContent];
      }
      return content;
    case 'link':
      return [
        {
          type: 'link',
          url: (markAttrs?.href as string) ?? '',
          title: null,
          children: content,
        } as PhrasingContent,
      ];
    default:
      return content;
  }
}

function convertInline(nodes: JSONContent[]): PhrasingContent[] {
  const result: PhrasingContent[] = [];

  for (const node of nodes) {
    if (!node.type) continue;

    if (node.type === 'text') {
      let current: PhrasingContent[] = [{ type: 'text', value: node.text ?? '' } as PhrasingContent];

      // 从内到外应用标记（Tiptap 中最后一个标记是最内层，MDAST 中最外层）
      // 需要按顺序应用：越早的阶段包裹越深
      const marks = node.marks ?? [];
      // MDAST 嵌套顺序：link > strong > emphasis > delete
      // Tiptap 标记顺序不保证嵌套，因此按固定优先级应用：
      const priority = ['code', 'strike', 'italic', 'bold', 'link'];
      const sorted = [...marks].sort((a, b) => priority.indexOf(a.type) - priority.indexOf(b.type));
      for (const mark of sorted) {
        current = wrapWithMark(current, mark.type, mark.attrs);
      }

      result.push(...current);
    } else if (node.type === 'image') {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      result.push({
        type: 'image',
        url: attrs.src ?? '',
        alt: attrs.alt ?? '',
        title: attrs.title || null,
      } as PhrasingContent);
    } else if (node.type === 'inlineMath') {
      result.push({
        type: 'inlineMath',
        value: (node.attrs as Record<string, string> | undefined)?.latex ?? '',
      } as PhrasingContent);
    }
    // 注：inlineComponent 处理已推迟 — 第二阶段通常不使用
  }

  return result;
}
