import { Mark } from '@tiptap/core';

export const CommentMark = Mark.create({
  name: 'commentMark',

  addAttributes() {
    return {
      threadId: { default: '' },
      resolved: { default: false, parseHTML: (el) => el.getAttribute('data-resolved') === 'true' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-mark]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { threadId, resolved, ...rest } = HTMLAttributes as Record<string, string>;
    return [
      'span',
      {
        'data-comment-mark': '',
        'data-thread-id': threadId,
        'data-resolved': resolved ? 'true' : 'false',
        class: resolved ? 'comment-highlight-resolved' : 'comment-highlight',
        ...rest,
      },
      0,
    ];
  },
});
