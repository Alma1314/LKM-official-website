import { Mark } from '@tiptap/core';

declare global {
  interface Window {
    renderMathInElement?: (el: HTMLElement) => void;
  }
}

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
        class: 'cursor-pointer text-primary hover:opacity-80 transition-opacity',
        ...HTMLAttributes,
      },
      0,
    ];
  },
});
