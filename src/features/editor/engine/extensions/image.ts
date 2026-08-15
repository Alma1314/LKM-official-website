import { nodeInputRule } from '@tiptap/core';
import ImageExtension from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageNodeView from '../../components/nodes/ImageNodeView';

export const CustomImage = ImageExtension.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: { default: null },
      height: { default: null },
      align: { default: 'center' },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { align, width, height, ...rest } = HTMLAttributes;
    return ['img', { ...rest, 'data-align': align, width, height }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView as Parameters<typeof ReactNodeViewRenderer>[0]);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /!(?:\[([^\]]*)\]\((\S+?)\))/,
        type: this.type,
        getAttributes: (match) => ({
          src: match[2] ?? '',
          alt: match[1] ?? '',
        }),
      }),
    ];
  },
});
