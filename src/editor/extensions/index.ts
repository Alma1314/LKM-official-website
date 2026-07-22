import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

export function getEditorExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      codeBlock: {
        HTMLAttributes: {
          class: 'rounded-lg',
        },
      },
    }),
    Placeholder.configure({
      placeholder: placeholder ?? '开始编写内容……',
    }),
    CharacterCount.configure({}),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary underline underline-offset-2 hover:opacity-80 transition-opacity',
      },
    }),
    Underline,
  ];
}
