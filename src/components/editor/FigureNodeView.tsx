import { memo, useState, useEffect, useRef } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';

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
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing]);
  const alt = (node.attrs.alt as string) ?? '';
  const caption = (node.attrs.caption as string) ?? '';
  const width = (node.attrs.width as number) ?? undefined;
  const align = (node.attrs.align as string) ?? 'center';

  const alignClasses: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <figure className={`relative my-4 ${alignClasses[align]}`} contentEditable={false} data-figure>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="cursor-pointer rounded-md border-2 border-dashed border-base-300 hover:border-primary/50 transition-colors inline-block"
          style={{
            width: width ? `${width}px` : 'auto',
            maxWidth: '100%',
            height: 'auto',
          }}
          onClick={() => setEditing(!editing)}
        />
      ) : (
        <div
          className="cursor-pointer border-2 border-dashed border-base-300 rounded-lg p-8 text-base-content/50 hover:border-primary/50 transition-colors"
          onClick={() => setEditing(!editing)}
        >
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-2"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <p className="text-sm">点击设置图片</p>
          </div>
        </div>
      )}
      {caption && <figcaption className="text-xs text-base-content/60 mt-1">{caption}</figcaption>}

      {editing && (
        <div ref={panelRef} className="absolute top-full left-0 mt-1 z-30 bg-base-200 border border-base-300 rounded-lg shadow-lg p-3 w-72 max-w-[calc(100vw-2rem)]">
          <label className="text-xs font-medium block mb-1">图片地址</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-2"
            value={src}
            placeholder="https://..."
            onChange={(e) => updateAttributes({ src: e.target.value })}
          />
          <label className="text-xs font-medium block mb-1">替代文本 (alt)</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-2"
            value={alt}
            placeholder="图片描述"
            onChange={(e) => updateAttributes({ alt: e.target.value })}
          />
          <label className="text-xs font-medium block mb-1">标题说明</label>
          <input
            type="text"
            className="input input-bordered input-sm w-full mb-2"
            value={caption}
            placeholder="图 1：说明文字"
            onChange={(e) => updateAttributes({ caption: e.target.value })}
          />
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1">宽度 (px)</label>
              <input
                type="number"
                className="input input-bordered input-sm w-full"
                value={width ?? ''}
                placeholder="自动"
                onChange={(e) => updateAttributes({ width: Number(e.target.value) || undefined })}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium block mb-1">对齐</label>
              <select
                className="select select-bordered select-sm w-full"
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
    </figure>
  );
});

export default FigureNodeView;
