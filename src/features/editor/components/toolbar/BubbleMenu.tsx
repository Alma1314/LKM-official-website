import { useEffect, useState, useCallback, useRef, memo } from 'react';
import type { Editor } from '@tiptap/core';
import LinkEditPopover from '../dialogs/LinkEditPopover';

interface BubbleMenuWrapperProps {
  editor: Editor;
  onComment?: (from: number, to: number, text: string) => void;
}

const BubbleMenuWrapper = memo(function BubbleMenuWrapper({ editor, onComment }: BubbleMenuWrapperProps) {
  const [show, setShow] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
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
    const scrollHandler = (): void => update();
    const editorDom = editor.view.dom;
    const scrollParent = editorDom.closest('[class*="overflow"]') || window;
    scrollParent.addEventListener('scroll', scrollHandler, { passive: true });

    const handleBlur = (): void => {
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

  // 链接浮层打开时需保留组件挂载（浮层依赖浏览器事件、点击外部关闭），此时不显示气泡按钮本体
  if (!show && !linkOpen) return null;

  return (
    <div className="rte-bubble-menu" style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)' }}>
      <button
        type="button"
        aria-label="加粗"
        title="加粗"
        className={`rte-toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBold().run();
        }}
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        aria-label="斜体"
        title="斜体"
        className={`rte-toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleItalic().run();
        }}
      >
        <em>I</em>
      </button>
      <button
        type="button"
        aria-label="下划线"
        title="下划线"
        className={`rte-toolbar-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleUnderline().run();
        }}
      >
        <span className="underline">U</span>
      </button>
      <button
        type="button"
        aria-label="删除线"
        title="删除线"
        className={`rte-toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleStrike().run();
        }}
      >
        <span className="line-through">S</span>
      </button>
      <button
        type="button"
        aria-label="行内代码"
        title="行内代码"
        className={`rte-toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCode().run();
        }}
      >
        {'</>'}
      </button>
      <div className="relative">
        <button
          type="button"
          aria-label="链接"
          title="链接"
          className={`rte-toolbar-btn ${editor.isActive('link') ? 'is-active' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            setLinkOpen(true);
          }}
        >
          🔗
        </button>
        {linkOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1">
            <LinkEditPopover editor={editor} onClose={() => setLinkOpen(false)} />
          </div>
        )}
      </div>
      {onComment && (
        <button
          type="button"
          className="rte-toolbar-btn"
          aria-label="添加评论"
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
