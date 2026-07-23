import { Node } from '@tiptap/core';
import type { NodeViewRendererProps } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import katex from 'katex';

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
    return ({ node: pmNode, view, getPos }: NodeViewRendererProps) => {
      const state = { node: pmNode as PMNode };
      const dom = document.createElement('div');
      dom.setAttribute('data-block-math', '');
      dom.className = 'my-4 text-center select-none cursor-pointer';
      dom.contentEditable = 'false';

      const render = (latex: string) => {
        if (latex) {
          try {
            dom.innerHTML = katex.renderToString(latex, {
              displayMode: true,
              throwOnError: false,
            });
          } catch {
            dom.innerHTML = '<span class="text-error text-sm">LaTeX 语法错误</span>';
          }
        } else {
          dom.innerHTML = '<span class="text-base-content/30 text-sm italic">点击编辑公式</span>';
        }
      };
      render((state.node.attrs.latex as string) || '');

      dom.addEventListener('click', () => {
        const curLatex = state.node.attrs.latex as string;
        const newLatex = window.prompt('编辑 LaTeX:', curLatex || '');
        if (newLatex !== null) {
          const pos = getPos();
          if (typeof pos === 'number') {
            const tr = view.state.tr;
            tr.setNodeMarkup(pos, undefined, { ...state.node.attrs, latex: newLatex });
            view.dispatch(tr);
          }
        }
      });

      return {
        dom,
        update: (updatedNode: PMNode) => {
          if (updatedNode.attrs.latex !== state.node.attrs.latex) {
            state.node = updatedNode;
            render((state.node.attrs.latex as string) || '');
            return true;
          }
          return false;
        },
      };
    };
  },
});
