/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Root, Table, List } from 'mdast';
import type { JSONContent } from '@tiptap/core';
import { toString as mdastToString } from 'mdast-util-to-string';

// In MDAST these are parent nodes wrapping text, in Tiptap they are marks on text nodes.
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
        const math = child as { value: string };
        result.push({ type: 'inlineMath', attrs: { latex: math.value } });
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
  for (const row of rows) {
    const cells = (row as any).children as any[];
    const rowContent: JSONContent[] = [];
    for (const cell of cells) {
      rowContent.push({
        type: 'tableCell',
        content: cell.children.length > 0 ? convertBlockChildren(cell.children as any[]) : [{ type: 'paragraph' }],
      });
    }
    tableContent.push({ type: 'tableRow', content: rowContent });
  }
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
  return {
    type: node.ordered ? 'orderedList' : 'bulletList',
    attrs: node.ordered ? { start: node.start ?? 1 } : undefined,
    content: (node.children as any[]).map(convertListItem),
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
        result.push({
          type: 'component',
          attrs: { name: 'MDXComponent', props: {}, source: mdastToString(child) },
        });
        break;
      }
      case 'mdxJsxTextElement': {
        result.push({
          type: 'inlineComponent',
          attrs: { name: 'MDXInlineComponent', props: {}, source: mdastToString(child) },
        });
        break;
      }
      case 'yaml':
        // frontmatter already extracted, skip
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
