import { useEffect, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/core';

interface BubbleMenuWrapperProps {
  editor: Editor;
}

export default function BubbleMenuWrapper({ editor }: BubbleMenuWrapperProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const update = useCallback(() => {
    const { from, to, empty } = editor.state.selection;
    if (empty || from === to) {
      setShow(false);
      return;
    }
    const start = editor.view.coordsAtPos(from);
    const end = editor.view.coordsAtPos(to);
    setPos({
      top: start.top - 44,
      left: (start.left + end.right) / 2,
    });
    setShow(true);
  }, [editor]);

  useEffect(() => {
    editor.on('selectionUpdate', update);
    editor.on('blur', () => setTimeout(() => setShow(false), 200));
    return () => {
      editor.off('selectionUpdate', update);
    };
  }, [editor, update]);

  if (!show) return null;

  return (
    <div
      className="fixed z-50 flex gap-0.5 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1"
      style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}
    >
      <button
        type="button"
        className={`btn btn-xs ${editor.isActive('bold') ? 'btn-active' : 'btn-ghost'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        className={`btn btn-xs ${editor.isActive('italic') ? 'btn-active' : 'btn-ghost'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        className={`btn btn-xs ${editor.isActive('underline') ? 'btn-active' : 'btn-ghost'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
      >
        <span className="underline">U</span>
      </button>
      <button
        type="button"
        className={`btn btn-xs ${editor.isActive('strike') ? 'btn-active' : 'btn-ghost'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
      >
        <span className="line-through">S</span>
      </button>
      <button
        type="button"
        className={`btn btn-xs ${editor.isActive('code') ? 'btn-active' : 'btn-ghost'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCode().run();
        }}
      >
        {'</>'}
      </button>
      <button
        type="button"
        className={`btn btn-xs ${editor.isActive('link') ? 'btn-active text-primary' : 'btn-ghost'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('输入链接:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }
        }}
      >
        🔗
      </button>
    </div>
  );
}
