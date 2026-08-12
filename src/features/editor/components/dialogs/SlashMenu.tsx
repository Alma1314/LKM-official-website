import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import type { Editor } from '@tiptap/core';
import TableInsertMenu from './TableInsertMenu';
import MathEditor from '../nodes/MathEditor';

interface MathDraft {
  isBlock: boolean;
  initialLatex: string;
}

interface SlashItem {
  label: string;
  description: string;
  icon: string;
  action: (editor: Editor) => void;
  /** 特殊交互：选中后进入二级面板（例如表格尺寸选择）而非立即执行 */
  submenu?: 'table' | 'inlineMath' | 'blockMath';
}

// 表格命令被组件内部引用做 submenu 识别；这里单独定义以保证引用稳定
function tableCommand(editor: Editor) {
  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
    description: '插入表格',
    icon: '⊞',
    action: tableCommand,
    submenu: 'table',
  },
  {
    label: '行内公式',
    description: '插入行内数学公式',
    icon: '𝑓',
    action: (e) => {
      const latex = 'x^2';
      e.chain()
        .focus()
        .insertContent({ type: 'text', text: latex, marks: [{ type: 'inlineMath', attrs: { latex } }] })
        .run();
    },
    submenu: 'inlineMath',
  },
  {
    label: '块级公式',
    description: '插入块级数学公式',
    icon: '∑',
    action: (e) => {
      const latex = '\\sum_{i=1}^{n} x_i';
      e.chain().focus().insertContent({ type: 'blockMath', attrs: { latex } }).run();
    },
    submenu: 'blockMath',
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
  const [tableMode, setTableMode] = useState(false);
  const [mathMode, setMathMode] = useState<MathDraft | null>(null);
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
          const sub = currentFiltered[selectedIdx].submenu;
          if (sub === 'table') {
            setTableMode(true);
          } else if (sub === 'inlineMath') {
            setMathMode({ isBlock: false, initialLatex: 'x^2' });
          } else if (sub === 'blockMath') {
            setMathMode({ isBlock: true, initialLatex: '\\sum_{i=1}^{n} x_i' });
          } else {
            currentFiltered[selectedIdx].action(editor);
            onSelect();
          }
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

  // 公式二级面板：MathEditor 模态框（插入行内/块级公式）
  if (mathMode) {
    return (
      <MathEditor
        initialLatex={mathMode.initialLatex}
        isBlock={mathMode.isBlock}
        onConfirm={(latex) => {
          if (mathMode.isBlock) {
            editor.chain().focus().insertContent({ type: 'blockMath', attrs: { latex } }).run();
          } else {
            editor
              .chain()
              .focus()
              .insertContent({ type: 'text', text: latex, marks: [{ type: 'inlineMath', attrs: { latex } }] })
              .run();
          }
          setMathMode(null);
          onSelect();
          onClose();
        }}
        onCancel={() => setMathMode(null)}
      />
    );
  }

  // 表格二级面板：选择行列数
  if (tableMode) {
    return (
      <div ref={menuRef} className="rte-slash-menu" style={{ top: position.top, left: position.left }}>
        <TableInsertMenu
          onInsert={(rows, cols) => {
            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            onSelect();
            onClose();
          }}
          onClose={() => {
            setTableMode(false);
            onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div ref={menuRef} className="rte-slash-menu" style={{ top: position.top, left: position.left }}>
      <div className="p-1">
        {filtered.slice(0, 8).map((item, idx) => (
          <button
            key={item.label}
            type="button"
            className={`rte-slash-item ${idx === selectedIdx ? 'is-selected' : ''}`}
            onClick={() => {
              const sub = item.submenu;
              if (sub === 'table') {
                setTableMode(true);
              } else if (sub === 'inlineMath') {
                setMathMode({ isBlock: false, initialLatex: 'x^2' });
              } else if (sub === 'blockMath') {
                setMathMode({ isBlock: true, initialLatex: '\\sum_{i=1}^{n} x_i' });
              } else {
                item.action(editor);
                onSelect();
              }
            }}
          >
            <span className="w-6 text-center font-mono text-deep-text/60">{item.icon}</span>
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-deep-text/50">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

export default SlashMenu;

export { ITEMS as SLASH_ITEMS };
