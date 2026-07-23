import { memo, useState } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';

interface RawMdxPlaceholderProps {
  node: Node;
  editor: Editor;
  getPos: () => number | undefined;
}

const RawMdxPlaceholder = memo(function RawMdxPlaceholder({ node, editor, getPos }: RawMdxPlaceholderProps) {
  const [showSource, setShowSource] = useState(false);
  const source = (node.attrs.source as string) ?? '';
  const sourceKind = (node.attrs.sourceKind as string) ?? 'flow';
  const truncatedSource = source.length > 200 ? source.slice(0, 200) + '…' : source;

  const handleDelete = () => {
    const pos = getPos();
    if (pos !== undefined) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + node.nodeSize })
        .run();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
    } catch (err) {
      console.warn('[RawMdxPlaceholder] 剪贴板操作失败:', err);
    }
  };

  return (
    <div
      className="my-2 border border-warning/40 rounded-lg bg-warning/10 p-4 select-none"
      contentEditable={false}
      data-raw-mdx
    >
      <div className="flex items-center gap-2 mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-warning"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-sm font-medium text-warning">
          此{sourceKind === 'text' ? '行内' : ''}内容暂不支持可视化编辑
        </span>
      </div>

      {showSource && (
        <pre className="text-xs bg-base-300/50 rounded p-2 mb-2 overflow-x-auto font-mono whitespace-pre-wrap">
          {truncatedSource}
        </pre>
      )}

      <div className="flex gap-1">
        <button type="button" className="btn btn-xs btn-ghost" onClick={() => setShowSource(!showSource)}>
          {showSource ? '隐藏源码' : '查看源码'}
        </button>
        <button type="button" className="btn btn-xs btn-ghost" onClick={handleCopy}>
          复制
        </button>
        <button type="button" className="btn btn-xs btn-ghost text-error" onClick={handleDelete}>
          删除
        </button>
      </div>
    </div>
  );
});

export default RawMdxPlaceholder;
