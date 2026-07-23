import { memo, useState } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';

interface CalloutNodeViewProps {
  node: Node;
  editor: Editor;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

const TYPE_LABELS: Record<string, string> = {
  info: '信息',
  warning: '警告',
  error: '错误',
  success: '成功',
};

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
  success: '✓',
};

const CalloutNodeView = memo(function CalloutNodeView({
  node,
  editor,
  getPos,
  updateAttributes,
}: CalloutNodeViewProps) {
  const [editing, setEditing] = useState(false);
  const ctype = ((node.attrs.type as string) || 'info') as keyof typeof TYPE_LABELS;
  const title = (node.attrs.title as string) || '';

  const alertClass = {
    info: 'alert-info',
    warning: 'alert-warning',
    error: 'alert-error',
    success: 'alert-success',
  }[ctype];

  return (
    <div className="relative my-2" contentEditable={false} data-callout>
      <div className={`alert ${alertClass} cursor-pointer`} onClick={() => setEditing(!editing)}>
        <span className="text-lg">{TYPE_ICONS[ctype]}</span>
        <div>
          {title && <h4 className="font-semibold text-sm">{title}</h4>}
          <p className="text-sm opacity-80">{TYPE_LABELS[ctype]} 提示 — 点击编辑属性</p>
        </div>
      </div>

      {editing && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-base-200 border border-base-300 rounded-lg shadow-lg p-3 w-64">
          <label className="text-xs font-medium block mb-1">类型</label>
          <select
            className="select select-bordered select-sm w-full mb-2"
            value={ctype}
            onChange={(e) => updateAttributes({ type: e.target.value })}
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <label className="text-xs font-medium block mb-1">标题（可选）</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-2"
            value={title}
            placeholder="输入标题"
            onChange={(e) => updateAttributes({ title: e.target.value })}
          />
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              className="btn btn-ghost btn-xs text-error"
              onMouseDown={(e) => {
                e.preventDefault();
                const pos = getPos();
                if (pos !== undefined) {
                  editor
                    .chain()
                    .focus()
                    .deleteRange({ from: pos, to: pos + node.nodeSize })
                    .run();
                }
              }}
            >
              删除
            </button>
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onMouseDown={(e) => {
                e.preventDefault();
                setEditing(false);
              }}
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CalloutNodeView;
