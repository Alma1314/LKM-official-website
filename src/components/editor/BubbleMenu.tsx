import { useEffect, useState, useCallback, useRef, memo } from 'react';
import type { Editor } from '@tiptap/core';

interface BubbleMenuWrapperProps {
  editor: Editor;
  onComment?: (from: number, to: number, text: string) => void;
}

const BubbleMenuWrapper = memo(function BubbleMenuWrapper({ editor, onComment }: BubbleMenuWrapperProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rafRef = useRef<number | null>(null);
  const lastSelectionRef = useRef<{ from: number; to: number; empty: boolean } | null>(null);

  const update = useCallback(() => {
    // requestAnimationFrame 防抖：连续 selectionUpdate 合并为一次更新
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const { from, to, empty } = editor.state.selection;
      // 去重：选区坐标未变化时跳过 layout 计算
      const prev = lastSelectionRef.current;
      if (prev && prev.from === from && prev.to === to && prev.empty === empty) {
        return;
      }
      lastSelectionRef.current = { from, to, empty };

      if (empty || from === to) {
        setShow(false);
        return;
      }
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      setPos({
        top: Math.max(8, start.top - 44),
        left: Math.min(window.innerWidth - 80, Math.max(80, (start.left + end.right) / 2)),
      });
      setShow(true);
    });
  }, [editor]);

  useEffect(() => {
    editor.on('selectionUpdate', update);
    // Listen to scroll within the editor's parent for position updates
    const scrollHandler = () => update();
    const editorDom = editor.view.dom;
    const scrollParent = editorDom.closest('[class*="overflow"]') || window;
    scrollParent.addEventListener('scroll', scrollHandler, { passive: true });

    const handleBlur = () => {
      lastSelectionRef.current = null;
      blurTimerRef.current = setTimeout(() => setShow(false), 200);
    };
    editor.on('blur', handleBlur);

    return () => {
      editor.off('selectionUpdate', update);
      editor.off('blur', handleBlur);
      scrollParent.removeEventListener('scroll', scrollHandler);
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
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
      {onComment && (
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          title="添加评论"
          onMouseDown={(e) => {
            e.preventDefault();
            const { from, to } = editor.state.selection;
            const text = editor.state.doc.textBetween(from, to, ' ');
            if (text.trim()) {
              onComment(from, to, text);
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}
    </div>
  );
});

export default BubbleMenuWrapper;