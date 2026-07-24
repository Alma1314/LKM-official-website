import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import type { Editor } from '@tiptap/core';

interface SlashItem {
  label: string;
  description: string;
  icon: string;
  action: (editor: Editor) => void;
}

const ITEMS: SlashItem[] = [
  {
    label: 'H1',
    description: '标题 1',
    icon: 'H1',
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'H2',
    description: '标题 2',
    icon: 'H2',
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'H3',
    description: '标题 3',
    icon: 'H3',
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: '无序列表',
    description: '项目符号列表',
    icon: '•',
    action: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: '有序列表',
    description: '编号列表',
    icon: '1.',
    action: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: '任务列表',
    description: '待办事项列表',
    icon: '☐',
    action: (e) => e.chain().focus().toggleTaskList().run(),
  },
  {
    label: '引用',
    description: '引用块',
    icon: '"',
    action: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: '代码块',
    description: '代码片段',
    icon: '</>',
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: '分割线',
    description: '水平分割线',
    icon: '—',
    action: (e) => e.chain().focus().setHorizontalRule().run(),
  },
  {
    label: '图片',
    description: '插入图片',
    icon: '🖼',
    action: (e) => {
      const url = window.prompt('输入图片地址:');
      if (url) {
        e.chain().focus().setImage({ src: url }).run();
      }
    },
  },
  {
    label: '表格',
    description: '插入 3×3 表格',
    icon: '⊞',
    action: (e) => {
      e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    },
  },
  {
    label: '行内公式',
    description: '插入行内数学公式',
    icon: '𝑓',
    action: (e) => {
      const latex = window.prompt('输入 LaTeX:') || 'x';
      e.chain()
        .focus()
        .insertContent({ type: 'text', text: latex, marks: [{ type: 'inlineMath', attrs: { latex } }] })
        .run();
    },
  },
  {
    label: '块级公式',
    description: '插入块级数学公式',
    icon: '∑',
    action: (e) => {
      const latex = window.prompt('输入 LaTeX:') || '\\sum_{i=1}^{n} x_i';
      e.chain().focus().insertContent({ type: 'blockMath', attrs: { latex } }).run();
    },
  },
  {
    label: 'Callout',
    description: '提示框组件',
    icon: '▸',
    action: (e) => {
      e.chain()
        .focus()
        .insertContent({ type: 'callout', attrs: { type: 'info' } })
        .run();
    },
  },
  {
    label: 'Figure',
    description: '图片组件',
    icon: '🖼',
    action: (e) => {
      e.chain().focus().insertContent({ type: 'figure', attrs: {} }).run();
    },
  },
  {
    label: 'AI 续写',
    description: 'AI 助手续写当前内容',
    icon: '🤖',
    action: () => {
      // AI panel is opened via DocumentEditor state
    },
  },
  {
    label: 'AI 总结',
    description: 'AI 助手总结当前内容',
    icon: '📝',
    action: () => {},
  },
];

interface SlashMenuProps {
  editor: Editor;
  query: string;
  position: { top: number; left: number } | null;
  onClose: () => void;
  onSelect: () => void;
}

const SlashMenu = memo(function SlashMenu({ editor, query, position, onClose, onSelect }: SlashMenuProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const q = query.toLowerCase();
  const filtered = useMemo(
    () => ITEMS.filter((item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)),
    [q]
  );

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const currentFiltered = filteredRef.current;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, currentFiltered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentFiltered[selectedIdx]) {
          currentFiltered[selectedIdx].action(editor);
          onSelect();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [editor, selectedIdx, onSelect, onClose]
  );

  useEffect(() => {
    if (!position) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, position]);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  if (!position || filtered.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-64 bg-base-100 border border-base-300 rounded-lg shadow-xl overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-1">
        {filtered.slice(0, 8).map((item, idx) => (
          <button
            key={item.label}
            type="button"
            className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
              idx === selectedIdx ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'
            }`}
            onClick={() => {
              item.action(editor);
              onSelect();
            }}
          >
            <span className="w-6 text-center font-mono text-base-content/60">{item.icon}</span>
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-base-content/50">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

export default SlashMenu;

export { ITEMS as SLASH_ITEMS };
