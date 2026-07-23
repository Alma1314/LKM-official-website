import { Mark } from '@tiptap/core';
import katex from 'katex';

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
    const latex = (HTMLAttributes.latex as string) || '';
    try {
      katex.renderToString(latex, { throwOnError: false });
    } catch {
      // let KaTeX handle errors silently
    }
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
