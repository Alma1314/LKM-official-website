import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RawMdxPlaceholder from '~/components/editor/RawMdxPlaceholder';

export const RawMdx = Node.create({
  name: 'rawMdx',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      source: { default: '' },
      sourceKind: { default: 'flow' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-raw-mdx]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-raw-mdx': '', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RawMdxPlaceholder);
  },
});
