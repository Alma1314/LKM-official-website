import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import BlockMathNodeView from '../../components/nodes/BlockMathNodeView';

export const BlockMath = Node.create({
  name: 'blockMath',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-block-math]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      {
        'data-block-math': '',
        class: 'my-4 text-center select-none cursor-pointer',
        ...HTMLAttributes,
      },
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockMathNodeView as Parameters<typeof ReactNodeViewRenderer>[0]);
  },
});
