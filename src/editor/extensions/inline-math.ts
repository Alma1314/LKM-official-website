import { Mark } from '@tiptap/core';

export const InlineMath = Mark.create({
  name: 'inlineMath',
  priority: 200,

  addAttributes() {
    return {
      latex: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-inline-math]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        'data-inline-math': '',
        'data-latex': latex,
        class: 'katex-inline cursor-pointer',
        ...HTMLAttributes,
      },
    ];
  },
});
