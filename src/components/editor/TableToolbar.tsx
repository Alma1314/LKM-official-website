import type { Editor } from '@tiptap/core';

interface TableToolbarProps {
  editor: Editor;
  onClose: () => void;
}

export default function TableToolbar({ editor, onClose }: TableToolbarProps) {
  const actions = [
    {
      label: '↑行',
      title: '上方插入行',
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      label: '↓行',
      title: '下方插入行',
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      label: '←列',
      title: '左方插入列',
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      label: '→列',
      title: '右方插入列',
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      label: '删行',
      title: '删除当前行',
      action: () => editor.chain().focus().deleteRow().run(),
      danger: true,
    },
    {
      label: '删列',
      title: '删除当前列',
      action: () => editor.chain().focus().deleteColumn().run(),
      danger: true,
    },
    {
      label: '删表',
      title: '删除整个表格',
      action: () => {
        editor.chain().focus().deleteTable().run();
        onClose();
      },
      danger: true,
    },
  ];

  return (
    <div className="absolute -top-12 left-0 z-30 flex gap-1 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          className={`btn btn-xs ${a.danger ? 'btn-ghost text-error' : 'btn-ghost'}`}
          title={a.title}
          onClick={a.action}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
