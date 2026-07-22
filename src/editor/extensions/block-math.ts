import { Node } from '@tiptap/core';

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

  renderHTML() {
    return ['div', { 'data-block-math': '', class: 'my-4 text-center' }, 0];
  },
});
