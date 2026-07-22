import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CalloutNodeView from '~/components/editor/CalloutNodeView';
import { calloutPropsSchema } from '~/editor/registry/schemas';

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      type: { default: 'info' },
      title: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-callout': '', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView as Parameters<typeof ReactNodeViewRenderer>[0]);
  },
});

export function parseCalloutProps(node: unknown): Record<string, unknown> {
  const raw = node as Record<string, unknown>;
  const attrs: Record<string, unknown> = {};
  const attributes = (raw.attributes ?? []) as Array<{
    type: string;
    name: string;
    value: string | number | boolean;
  }>;

  for (const attr of attributes) {
    if (attr.type === 'mdxJsxAttribute') {
      attrs[attr.name] = attr.value;
    }
  }

  return calloutPropsSchema.parse(attrs) as Record<string, unknown>;
}

export function serializeCalloutProps(props: Record<string, unknown>): string {
  const valid = calloutPropsSchema.parse(props);
  return Object.entries(valid)
    .filter(([, v]) => v !== '' && v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'string') return `${k}="${v}"`;
      if (typeof v === 'number') return `${k}={${v}}`;
      return `${k}="${String(v)}"`;
    })
    .join(' ');
}
