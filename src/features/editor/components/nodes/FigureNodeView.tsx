import { memo, useState, useEffect, useRef } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import FigureView from '../shared/FigureView';

interface FigureNodeViewProps {
  node: Node;
  editor: Editor;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

const FigureNodeView = memo(function FigureNodeView({ node, editor, getPos, updateAttributes }: FigureNodeViewProps) {
  const [editing, setEditing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const src = (node.attrs.src as string) ?? '';

  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(e.target as HTMLElement)) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing]);
  const alt = (node.attrs.alt as string) ?? '';
  const caption = (node.attrs.caption as string) ?? '';
  const width = (node.attrs.width as number) ?? undefined;
  const align = (node.attrs.align as 'left' | 'center' | 'right') ?? 'center';

  return (
    <NodeViewWrapper as="figure" className="relative my-4" contentEditable={false} data-figure>
      <div className="cursor-pointer" onClick={() => setEditing(!editing)}>
        <FigureView src={src} alt={alt} caption={caption} width={width} align={align} />
      </div>

      {editing && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 mt-1 z-30 bg-page-bg border border-surface-3 rounded-lg shadow-lg p-3 w-72 max-w-[calc(100vw-2rem)]"
        >
          <label className="text-xs font-medium block mb-1">图片地址</label>
          <input
            type="text"
            className="rte-input rte-input--sm w-full mb-2"
            value={src}
            placeholder="https://..."
            onChange={(e) => updateAttributes({ src: e.target.value })}
          />
          <label className="text-xs font-medium block mb-1">替代文本 (alt)</label>
          <input
            type="text"
            className="rte-input rte-input--sm w-full mb-2"
            value={alt}
            placeholder="图片描述"
            onChange={(e) => updateAttributes({ alt: e.target.value })}
          />
          <label className="text-xs font-medium block mb-1">标题说明</label>
          <input
            type="text"
            className="rte-input rte-input--sm w-full mb-2"
            value={caption}
            placeholder="图 1：说明文字"
            onChange={(e) => updateAttributes({ caption: e.target.value })}
          />
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1">宽度 (px)</label>
              <input
                type="number"
                className="rte-input rte-input--sm w-full"
                value={width ?? ''}
                placeholder="自动"
                onChange={(e) => updateAttributes({ width: Number(e.target.value) || undefined })}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1">对齐</label>
              <select
                className="rte-select rte-select--sm w-full"
                value={align}
                onChange={(e) => updateAttributes({ align: e.target.value })}
              >
                <option value="left">左对齐</option>
                <option value="center">居中</option>
                <option value="right">右对齐</option>
              </select>
            </div>
          </div>
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              className="rte-btn rte-btn--ghost rte-btn--xs text-error"
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
              className="rte-btn rte-btn--primary rte-btn--xs"
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
    </NodeViewWrapper>
  );
});

export default FigureNodeView;
