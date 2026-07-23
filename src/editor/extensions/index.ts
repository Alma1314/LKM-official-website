import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { CustomImage } from './image';
import { InlineMath } from './inline-math';
import { BlockMath } from './block-math';
import { RawMdx } from './raw-mdx';
import { Callout } from './callout';
import { Figure } from './figure';
import { CommentMark } from './comment-mark';

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
    CustomImage,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    InlineMath,
    BlockMath,
    RawMdx,
    Callout,
    Figure,
    CommentMark,
  ];
}
