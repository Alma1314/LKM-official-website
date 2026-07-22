import { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/core';

interface PropertyPanelProps {
  editor: Editor;
}

const EDITABLE_NODE_TYPES = ['callout', 'figure', 'image'];

export default function PropertyPanel({ editor }: PropertyPanelProps) {
  const [selectedNode, setSelectedNode] = useState<{
    type: string;
    attrs: Record<string, unknown>;
    pos: number;
  } | null>(null);

  useEffect(() => {
    const handler = () => {
      const { $from } = editor.state.selection;
      const node = $from.node($from.depth);
      if (node && EDITABLE_NODE_TYPES.includes(node.type.name)) {
        setSelectedNode({
          type: node.type.name,
          attrs: { ...node.attrs },
          pos: $from.start($from.depth),
        });
      } else {
        setSelectedNode(null);
      }
    };

    editor.on('selectionUpdate', handler);
    return () => {
      editor.off('selectionUpdate', handler);
    };
  }, [editor]);

  if (!selectedNode) return null;

  const handleUpdate = (key: string, value: unknown) => {
    editor
      .chain()
      .focus()
      .updateAttributes(selectedNode.type, { [key]: value })
      .run();
    setSelectedNode((prev) => (prev ? { ...prev, attrs: { ...prev.attrs, [key]: value } } : null));
  };

  const handleNumberUpdate = (key: string, value: string) => {
    const num = Number(value);
    handleUpdate(key, Number.isNaN(num) ? undefined : num);
  };

  return (
    <div className="w-64 border-l border-base-300 bg-base-200/50 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-3">
        {selectedNode.type === 'callout' ? '提示框属性' : selectedNode.type === 'figure' ? '图片属性' : '属性'}
      </h3>

      {selectedNode.type === 'callout' && (
        <>
          <label className="text-xs font-medium block mb-1">类型</label>
          <select
            className="select select-bordered select-sm w-full mb-3"
            value={(selectedNode.attrs.type as string) || 'info'}
            onChange={(e) => handleUpdate('type', e.target.value)}
          >
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
            <option value="success">成功</option>
          </select>
          <label className="text-xs font-medium block mb-1">标题</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.title as string) || ''}
            onChange={(e) => handleUpdate('title', e.target.value)}
          />
        </>
      )}

      {selectedNode.type === 'figure' && (
        <>
          <label className="text-xs font-medium block mb-1">图片地址</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.src as string) || ''}
            onChange={(e) => handleUpdate('src', e.target.value)}
          />
          <label className="text-xs font-medium block mb-1">Alt 文本</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.alt as string) || ''}
            onChange={(e) => handleUpdate('alt', e.target.value)}
          />
          <label className="text-xs font-medium block mb-1">标题说明</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.caption as string) || ''}
            onChange={(e) => handleUpdate('caption', e.target.value)}
          />
          <label className="text-xs font-medium block mb-1">宽度 (px)</label>
          <input
            type="number"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.width as number) || ''}
            onChange={(e) => handleNumberUpdate('width', e.target.value)}
          />
          <label className="text-xs font-medium block mb-1">对齐</label>
          <select
            className="select select-bordered select-sm w-full mb-3"
            value={(selectedNode.attrs.align as string) || 'center'}
            onChange={(e) => handleUpdate('align', e.target.value)}
          >
            <option value="left">左对齐</option>
            <option value="center">居中</option>
            <option value="right">右对齐</option>
          </select>
        </>
      )}

      {selectedNode.type === 'image' && (
        <>
          <label className="text-xs font-medium block mb-1">图片地址</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.src as string) || ''}
            onChange={(e) => handleUpdate('src', e.target.value)}
          />
          <label className="text-xs font-medium block mb-1">Alt 文本</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-3"
            value={(selectedNode.attrs.alt as string) || ''}
            onChange={(e) => handleUpdate('alt', e.target.value)}
          />
        </>
      )}
    </div>
  );
}
