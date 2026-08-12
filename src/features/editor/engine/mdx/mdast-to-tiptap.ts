/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Root, Table, List } from 'mdast';
import type { JSONContent } from '@tiptap/core';
import { toString as mdastToString } from 'mdast-util-to-string';

// MDAST 中这些是包裹文本的父节点，Tiptap 中它们是文本节点上的标记。
interface MarkContext {
  type: 'strong' | 'emphasis' | 'delete' | 'link' | 'inlineCode';
  attrs?: Record<string, unknown>;
}

function marksToTiptap(marks: MarkContext[]): JSONContent['marks'] {
  if (marks.length === 0) return undefined;
  return marks.map((m) => {
    const markType =
      m.type === 'strong'
        ? 'bold'
        : m.type === 'emphasis'
          ? 'italic'
          : m.type === 'delete'
            ? 'strike'
            : m.type === 'inlineCode'
              ? 'code'
              : m.type === 'link'
                ? 'link'
                : m.type;
    return { type: markType, ...(m.attrs ? { attrs: m.attrs } : {}) };
  });
}

function convertInlineChildren(children: any[], ancestors: any[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const child of children) {
    switch (child.type) {
      case 'text':
        result.push({
          type: 'text',
          text: child.value as string,
          marks: marksToTiptap(
            ancestors.map((a) => ({
              type: a.type as MarkContext['type'],
              attrs: a.type === 'link' ? { href: (a as any).url } : undefined,
            }))
          ),
        });
        break;
      case 'inlineCode':
        result.push({
          type: 'text',
          text: child.value as string,
          marks: [
            ...(marksToTiptap(
              ancestors.map((a) => ({
                type: a.type as MarkContext['type'],
                attrs: a.type === 'link' ? { href: (a as any).url } : undefined,
              }))
            ) ?? []),
            { type: 'code' },
          ],
        });
        break;
      case 'strong':
      case 'emphasis':
      case 'delete':
      case 'link':
        result.push(...convertInlineChildren(child.children as any[], [...ancestors, child]));
        break;
      case 'image': {
        const img = child as { url: string; alt?: string; title?: string | null };
        result.push({
          type: 'image',
          attrs: { src: img.url, alt: img.alt ?? '', title: img.title ?? '' },
        });
        break;
      }
      case 'inlineMath': {
        // inlineMath 在 Tiptap 中是 Mark 而非节点：镜像编辑器的表示，
        // 用文本 + inlineMath mark（与 SlashMenu/工具栏插入时的格式一致）
        const math = child as { value: string };
        const value = math.value ?? '';
        result.push({
          type: 'text',
          text: value,
          marks: [
            ...(marksToTiptap(
              ancestors.map((a) => ({
                type: a.type as MarkContext['type'],
                attrs: a.type === 'link' ? { href: (a as any).url } : undefined,
              }))
            ) ?? []),
            { type: 'inlineMath', attrs: { latex: value } },
          ],
        });
        break;
      }
      default:
        result.push({ type: 'text', text: mdastToString(child) });
    }
  }

  return result;
}

function convertTable(node: Table): JSONContent {
  const tableContent: JSONContent[] = [];
  const rows = (node as any).children as any[];
  rows.forEach((row, rowIndex) => {
    const cells = (row as any).children as any[];
    const rowContent: JSONContent[] = [];
    for (const cell of cells) {
      // GFM 表首行即表头（remark-gfm 不区分 cell 类型，但 markdown 语法首行就是 header）
      const cellType = rowIndex === 0 ? 'tableHeader' : 'tableCell';
      const children = cell.children as any[];
      const hasBlock = children.some((c) =>
        [
          'paragraph',
          'heading',
          'code',
          'list',
          'table',
          'blockquote',
          'math',
          'thematicBreak',
          'html',
          'image',
        ].includes(c.type)
      );
      let content: JSONContent[];
      if (hasBlock) {
        // 单元格含块级内容（罕见）时按块级转换
        content = convertBlockChildren(children);
      } else {
        // 常规 GFM 单元格是纯内联内容（text/strong/emphasis/link 等），不能丢给块级转换器转成 rawMdx
        const inline = convertInlineChildren(children, []);
        content = inline.length > 0 ? [{ type: 'paragraph', content: inline }] : [{ type: 'paragraph' }];
      }
      rowContent.push({ type: cellType, content });
    }
    tableContent.push({ type: 'tableRow', content: rowContent });
  });
  return { type: 'table', content: tableContent };
}

function convertListItem(item: any): JSONContent {
  if (item.checked !== null && item.checked !== undefined) {
    return {
      type: 'taskItem',
      attrs: { checked: Boolean(item.checked) },
      content: convertBlockChildren(item.children),
    };
  }
  return {
    type: 'listItem',
    content: convertBlockChildren(item.children),
  };
}

function convertList(node: List): JSONContent {
  const items = (node.children as any[]).map(convertListItem);
  // GFM 任务列表 `- [x] 项` 的 listItem 带 checked，容器应为 taskList（与 Tiptap TaskList 一致）
  const isTaskList = items.some((i) => i.type === 'taskItem');
  if (isTaskList) {
    return { type: 'taskList', content: items };
  }
  return {
    type: node.ordered ? 'orderedList' : 'bulletList',
    attrs: node.ordered ? { start: node.start ?? 1 } : undefined,
    content: items,
  };
}

function convertBlockChildren(children: any[]): JSONContent[] {
  const result: JSONContent[] = [];

  for (const child of children) {
    switch (child.type) {
      case 'paragraph': {
        const content = convertInlineChildren(child.children as any[], []);
        result.push({ type: 'paragraph', content });
        break;
      }
      case 'heading': {
        result.push({
          type: 'heading',
          attrs: { level: child.depth as number },
          content: convertInlineChildren(child.children as any[], []),
        });
        break;
      }
      case 'blockquote': {
        result.push({
          type: 'blockquote',
          content: convertBlockChildren(child.children as any[]),
        });
        break;
      }
      case 'code': {
        result.push({
          type: 'codeBlock',
          attrs: { language: (child.lang as string) ?? '' },
          content: [{ type: 'text', text: child.value as string }],
        });
        break;
      }
      case 'thematicBreak':
        result.push({ type: 'horizontalRule' });
        break;
      case 'list':
        result.push(convertList(child as unknown as List));
        break;
      case 'table':
        result.push(convertTable(child as unknown as Table));
        break;
      case 'math': {
        result.push({
          type: 'blockMath',
          attrs: { latex: child.value as string },
        });
        break;
      }
      // 注：inlineMath 是 Mark，行内公式由 convertInlineChildren 处理，块级不存在该节点。
      case 'image': {
        const img = child as { url: string; alt?: string; title?: string | null };
        result.push({
          type: 'image',
          attrs: { src: img.url, alt: img.alt ?? '', title: img.title ?? '' },
        });
        break;
      }
      case 'html': {
        result.push({
          type: 'rawMdx',
          attrs: { source: child.value as string, sourceKind: 'flow' },
        });
        break;
      }
      case 'mdxJsxFlowElement': {
        const el = child as {
          name?: string;
          attributes?: Array<{ type: string; name: string; value: string | number | boolean }>;
        };
        const name = el.name ?? '';
        if (name === 'Callout') {
          const attrs: Record<string, unknown> = {};
          for (const attr of el.attributes ?? []) {
            if (attr.type === 'mdxJsxAttribute') {
              attrs[attr.name] = attr.value;
            }
          }
          result.push({ type: 'callout', attrs });
        } else if (name === 'Figure') {
          const attrs: Record<string, unknown> = {};
          for (const attr of el.attributes ?? []) {
            if (attr.type === 'mdxJsxAttribute') {
              attrs[attr.name] = attr.value;
            }
          }
          result.push({ type: 'figure', attrs });
        } else {
          result.push({
            type: 'rawMdx',
            attrs: { source: mdastToString(child), sourceKind: 'flow' },
          });
        }
        break;
      }
      case 'mdxJsxTextElement': {
        const el = child as { name?: string };
        const name = el.name ?? '';
        if (name === 'Callout' || name === 'Figure') {
          // 内联 Callout/Figure 不常见，作为 rawMdx 处理
          result.push({
            type: 'rawMdx',
            attrs: { source: mdastToString(child), sourceKind: 'text' },
          });
        } else {
          result.push({
            type: 'rawMdx',
            attrs: { source: mdastToString(child), sourceKind: 'text' },
          });
        }
        break;
      }
      case 'yaml':
        // frontmatter 已提取，跳过
        break;
      default:
        result.push({
          type: 'rawMdx',
          attrs: { source: mdastToString(child), sourceKind: 'flow' },
        });
    }
  }

  return result;
}

export function mdastToTiptap(root: Root): JSONContent[] {
  return convertBlockChildren(root.children);
}
