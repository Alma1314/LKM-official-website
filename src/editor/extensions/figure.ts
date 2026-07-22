import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FigureNodeView from '~/components/editor/FigureNodeView';
import { figurePropsSchema } from '~/editor/registry/schemas';

export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: '' },
      alt: { default: '' },
      caption: { default: '' },
      width: { default: null },
      align: { default: 'center' },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-figure]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', { 'data-figure': '', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureNodeView as Parameters<typeof ReactNodeViewRenderer>[0]);
  },
});

export function parseFigureProps(node: unknown): Record<string, unknown> {
  const raw = (node as Record<string, unknown>).attributes as
    | Array<{
        type: string;
        name: string;
        value: string | number | boolean;
      }>
    | undefined;
  const attrs: Record<string, unknown> = {};

  if (raw) {
    for (const attr of raw) {
      if (attr.type === 'mdxJsxAttribute') {
        attrs[attr.name] = attr.value;
      }
    }
  }

  return figurePropsSchema.parse(attrs) as Record<string, unknown>;
}

export function serializeFigureProps(props: Record<string, unknown>): string {
  const valid = figurePropsSchema.parse(props);
  return Object.entries(valid)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'string') return `${k}="${v}"`;
      if (typeof v === 'number') return `${k}={${v}}`;
      return `${k}="${String(v)}"`;
    })
    .join(' ');
}
