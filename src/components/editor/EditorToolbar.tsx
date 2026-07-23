import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { ReactNode } from 'react';
import EditorToolbarButton from './EditorToolbarButton';

interface ToolbarItemDef {
  key: string;
  icon: ReactNode;
  label: string;
  title: string;
  group: 'format' | 'heading' | 'block' | 'list' | 'insert' | 'component' | 'history';
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

const B = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
  </svg>
);
const I = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 4h-6a4 4 0 0 0-4 4v12" />
    <path d="M9 12h6" />
  </svg>
);
const U = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 4v6a6 6 0 0 0 12 0V4" />
    <path d="M4 20h16" />
  </svg>
);
const S = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 4H9a3 3 0 0 0-2.83 4" />
    <path d="M14 12a4 4 0 0 1 0 8H6" />
    <path d="M4 12h20" />
  </svg>
);
const Code = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m18 16 4-4-4-4" />
    <path d="m6 8-4 4 4 4" />
    <path d="m14.5 4-5 16" />
  </svg>
);
const H1 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="m17 12 3-2v8" />
  </svg>
);
const H2 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2-3-2" />
  </svg>
);
const H3 = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" />
    <path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" />
  </svg>
);
const Blockquote = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2M16 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3" />
  </svg>
);
const Ul = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
);
const Ol = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 6h11" />
    <path d="M10 12h11" />
    <path d="M10 18h11" />
    <path d="M4 6h1v4" />
    <path d="M4 10h2" />
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
  </svg>
);
const TaskList = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 6h11" />
    <path d="M10 12h11" />
    <path d="M10 18h11" />
    <path d="M4 6h1v1H4z" />
    <path d="M4 12h1v1H4z" />
    <path d="M4 18h1v1H4z" />
  </svg>
);
const Hr = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12h16" />
  </svg>
);
const CodeBlock = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 4h18v4H3z" />
    <path d="M7 8v12h10V8" />
  </svg>
);
const Link = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const Undo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </svg>
);
const Redo = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 7v6h-6" />
    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
  </svg>
);

function buildToolbarItems(): ToolbarItemDef[] {
  return [
    {
      key: 'h1',
      icon: H1,
      label: 'H1',
      title: '标题 1',
      group: 'heading',
      action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e) => e.isActive('heading', { level: 1 }),
    },
    {
      key: 'h2',
      icon: H2,
      label: 'H2',
      title: '标题 2',
      group: 'heading',
      action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive('heading', { level: 2 }),
    },
    {
      key: 'h3',
      icon: H3,
      label: 'H3',
      title: '标题 3',
      group: 'heading',
      action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive('heading', { level: 3 }),
    },
    {
      key: 'bold',
      icon: B,
      label: '加粗',
      title: '加粗 (Ctrl+B)',
      group: 'format',
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive('bold'),
    },
    {
      key: 'italic',
      icon: I,
      label: '斜体',
      title: '斜体 (Ctrl+I)',
      group: 'format',
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive('italic'),
    },
    {
      key: 'underline',
      icon: U,
      label: '下划线',
      title: '下划线 (Ctrl+U)',
      group: 'format',
      action: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive('underline'),
    },
    {
      key: 'strike',
      icon: S,
      label: '删除线',
      title: '删除线',
      group: 'format',
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive('strike'),
    },
    {
      key: 'code',
      icon: Code,
      label: '行内代码',
      title: '行内代码',
      group: 'format',
      action: (e) => e.chain().focus().toggleCode().run(),
      isActive: (e) => e.isActive('code'),
    },
    {
      key: 'link',
      icon: Link,
      label: '链接',
      title: '插入链接',
      group: 'insert',
      action: (e) => {
        const prevUrl = e.getAttributes('link').href;
        if (prevUrl) {
          e.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
          const url = window.prompt('输入链接地址:');
          if (url) {
            e.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }
        }
      },
      isActive: (e) => e.isActive('link'),
    },
    {
      key: 'blockquote',
      icon: Blockquote,
      label: '引用',
      title: '引用块',
      group: 'block',
      action: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive('blockquote'),
    },
    {
      key: 'bulletList',
      icon: Ul,
      label: '无序列表',
      title: '无序列表',
      group: 'list',
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive('bulletList'),
    },
    {
      key: 'orderedList',
      icon: Ol,
      label: '有序列表',
      title: '有序列表',
      group: 'list',
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive('orderedList'),
    },
    {
      key: 'taskList',
      icon: TaskList,
      label: '任务列表',
      title: '任务列表',
      group: 'list',
      action: (e) => e.chain().focus().toggleTaskList().run(),
      isActive: (e) => e.isActive('taskList'),
    },
    {
      key: 'codeBlock',
      icon: CodeBlock,
      label: '代码块',
      title: '代码块',
      group: 'block',
      action: (e) => e.chain().focus().toggleCodeBlock().run(),
      isActive: (e) => e.isActive('codeBlock'),
    },
    {
      key: 'horizontalRule',
      icon: Hr,
      label: '分割线',
      title: '分割线',
      group: 'insert',
      action: (e) => e.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
    {
      key: 'undo',
      icon: Undo,
      label: '撤销',
      title: '撤销 (Ctrl+Z)',
      group: 'history',
      action: (e) => e.chain().focus().undo().run(),
      isActive: () => false,
    },
    {
      key: 'redo',
      icon: Redo,
      label: '重做',
      title: '重做 (Ctrl+Shift+Z)',
      group: 'history',
      action: (e) => e.chain().focus().redo().run(),
      isActive: () => false,
    },
    {
      key: 'image',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
      label: '图片',
      title: '插入图片',
      group: 'insert',
      action: (e) => {
        const url = window.prompt('输入图片地址:');
        if (url) e.chain().focus().setImage({ src: url }).run();
      },
      isActive: () => false,
    },
    {
      key: 'inlineMath',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19h16" />
          <path d="M4 5h16" />
          <path d="M8 12h8" />
        </svg>
      ),
      label: '行内公式',
      title: '插入行内公式',
      group: 'insert',
      action: (e) => {
        const latex = window.prompt('输入 LaTeX:', 'x^2');
        if (latex) {
          e.chain()
            .focus()
            .insertContent({
              type: 'text',
              text: latex,
              marks: [{ type: 'inlineMath', attrs: { latex } }],
            })
            .run();
        }
      },
      isActive: () => false,
    },
    {
      key: 'blockMath',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19h16" />
          <path d="M8 12h8" />
          <path d="M20 5H4" />
        </svg>
      ),
      label: '块级公式',
      title: '插入块级公式',
      group: 'insert',
      action: (e) => {
        const latex = window.prompt('输入 LaTeX:', '\\sum_{i=1}^{n} x_i');
        if (latex) {
          e.chain().focus().insertContent({ type: 'blockMath', attrs: { latex } }).run();
        }
      },
      isActive: () => false,
    },
    {
      key: 'table',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M12 3v18" />
        </svg>
      ),
      label: '表格',
      title: '插入 3×3 表格',
      group: 'insert',
      action: (e) => {
        e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
      isActive: () => false,
    },
    {
      key: 'callout',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      label: 'Callout',
      title: '插入提示框',
      group: 'component',
      action: (e) => {
        e.chain()
          .focus()
          .insertContent({ type: 'callout', attrs: { type: 'info' } })
          .run();
      },
      isActive: () => false,
    },
    {
      key: 'figure',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      ),
      label: 'Figure',
      title: '插入图片组件',
      group: 'component',
      action: (e) => {
        e.chain().focus().insertContent({ type: 'figure', attrs: {} }).run();
      },
      isActive: () => false,
    },
  ];
}

const ITEMS = buildToolbarItems();
const GROUPS = ['heading', 'format', 'insert', 'block', 'list', 'component', 'history'] as const;
// Groups that go into "more" menu on small screens
const MORE_GROUPS = new Set(['component', 'history']);

interface EditorToolbarProps {
  editor: Editor;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const renderButton = (item: (typeof ITEMS)[number]) => (
    <EditorToolbarButton
      key={item.key}
      icon={item.icon}
      label={item.label}
      title={item.title}
      isActive={item.isActive(editor)}
      onClick={() => item.action(editor)}
    />
  );

  return (
    <div className="sticky top-0 z-20 bg-base-100/95 backdrop-blur-sm border-b border-base-300 rounded-t-lg">
      {/* Desktop: full toolbar. Mobile: inline groups + "more" overflow */}
      <div className="hidden md:flex flex-wrap items-center gap-x-1 gap-y-0.5 p-2">
        {GROUPS.map((group) => {
          const items = ITEMS.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <div
              key={group}
              className="flex items-center gap-0.5 border-r border-base-300 pr-1 mr-1 last:border-r-0 last:pr-0 last:mr-0"
            >
              {items.map(renderButton)}
            </div>
          );
        })}
      </div>

      {/* Mobile: condensed toolbar with "more" dropdown */}
      <div className="flex md:hidden items-center gap-x-0.5 p-1.5 overflow-x-auto scrollbar-none">
        {GROUPS.filter((g) => !MORE_GROUPS.has(g)).map((group) => {
          const items = ITEMS.filter((i) => i.group === group);
          if (items.length === 0) return null;
          return (
            <div
              key={group}
              className="flex items-center gap-0.5 shrink-0 border-r border-base-300 pr-0.5 mr-0.5 last:border-r-0 last:pr-0 last:mr-0"
            >
              {items.map(renderButton)}
            </div>
          );
        })}
        {/* More button */}
        <div className="relative shrink-0">
          <button
            type="button"
            className={`btn btn-ghost btn-sm gap-1 ${moreOpen ? 'btn-active' : ''}`}
            onClick={() => setMoreOpen(!moreOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
          {moreOpen && (
            <div className="absolute top-full right-0 mt-1 z-40 bg-base-200 border border-base-300 rounded-lg shadow-lg p-2 min-w-[200px]">
              {GROUPS.filter((g) => MORE_GROUPS.has(g)).map((group) => (
                <div key={group} className="mb-1 last:mb-0">
                  <div className="text-xs text-base-content/50 px-1 mb-0.5">
                    {group === 'component' ? '组件' : '操作'}
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {ITEMS.filter((i) => i.group === group).map(renderButton)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
