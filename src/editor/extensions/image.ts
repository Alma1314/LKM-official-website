import ImageExtension from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ImageNodeView from '~/components/editor/ImageNodeView';

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
});
