import { memo, useState, useEffect, useRef } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import InlineInput from './InlineInput';

interface ImageNodeViewProps {
  node: Node;
  editor: Editor;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

const ImageNodeView = memo(function ImageNodeView({ node, editor, getPos, updateAttributes }: ImageNodeViewProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [inlineMode, setInlineMode] = useState<'url' | 'alt' | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const src = (node.attrs.src as string) ?? '';

  useEffect(() => {
    if (!showToolbar) return;
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as HTMLElement)) {
        setShowToolbar(false);
        setInlineMode(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showToolbar]);
  const alt = (node.attrs.alt as string) ?? '';
  const title = (node.attrs.title as string) ?? '';
  const width = (node.attrs.width as number) ?? undefined;
  const height = (node.attrs.height as number) ?? undefined;
  const align = (node.attrs.align as string) ?? 'center';

  const alignClasses: Record<string, string> = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  return (
    <div className={`relative inline-block group ${alignClasses[align] ?? ''}`} contentEditable={false} data-image-node>
      <img
        src={src}
        alt={alt}
        title={title || undefined}
        style={{
          width: width ? `${width}px` : 'auto',
          height: height ? `${height}px` : 'auto',
          maxWidth: '100%',
        }}
        className="rounded-md cursor-pointer border-2 border-transparent hover:border-primary/50 transition-colors"
        onClick={() => setShowToolbar(!showToolbar)}
        onTouchEnd={(e) => {
          // Long-press on mobile to toggle toolbar
          if (window.innerWidth < 768) {
            e.preventDefault();
            setShowToolbar(!showToolbar);
          }
        }}
        draggable={false}
      />

      {showToolbar && (
        <div
          ref={toolbarRef}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-1 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1 max-w-[calc(100vw-2rem)]"
        >
          {/* Resize inputs */}
          <input
            type="number"
            className="input input-xs input-bordered w-16"
            value={width ?? ''}
            placeholder="宽"
            onChange={(e) => updateAttributes({ width: Number(e.target.value) || undefined })}
          />
          <input
            type="number"
            className="input input-xs input-bordered w-16"
            value={height ?? ''}
            placeholder="高"
            onChange={(e) => updateAttributes({ height: Number(e.target.value) || undefined })}
          />
          {/* Align buttons */}
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              type="button"
              className={`btn btn-xs ${align === a ? 'btn-active' : 'btn-ghost'}`}
              onClick={() => updateAttributes({ align: a })}
              title={`${a === 'left' ? '左' : a === 'center' ? '中' : '右'}对齐`}
            >
              {a === 'left' ? '←' : a === 'center' ? '↔' : '→'}
            </button>
          ))}
          {/* Alt text */}
          <button
            type="button"
            className={`btn btn-xs ${inlineMode === 'alt' ? 'btn-active' : 'btn-ghost'}`}
            title="替代文本"
            onClick={() => setInlineMode(inlineMode === 'alt' ? null : 'alt')}
          >
            Alt
          </button>
          {/* URL insert */}
          <button
            type="button"
            className={`btn btn-xs ${inlineMode === 'url' ? 'btn-active' : 'btn-ghost'}`}
            title="替换图片"
            onClick={() => setInlineMode(inlineMode === 'url' ? null : 'url')}
          >
            替换
          </button>
          {/* Delete */}
          <button
            type="button"
            className="btn btn-xs btn-ghost text-error"
            title="删除图片"
            onClick={() => {
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
            ×
          </button>
        </div>
      )}

      {/* Inline input for URL or Alt */}
      {inlineMode === 'url' && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-40">
          <InlineInput
            placeholder="输入图片地址"
            defaultValue={src}
            onConfirm={(val) => {
              updateAttributes({ src: val });
              setInlineMode(null);
            }}
            onCancel={() => setInlineMode(null)}
          />
        </div>
      )}
      {inlineMode === 'alt' && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-40">
          <InlineInput
            placeholder="替代文本 (alt)"
            defaultValue={alt}
            onConfirm={(val) => {
              updateAttributes({ alt: val });
              setInlineMode(null);
            }}
            onCancel={() => setInlineMode(null)}
          />
        </div>
      )}

      {/* Caption */}
      {title && <p className="text-xs text-center text-base-content/60 mt-1">{title}</p>}
    </div>
  );
});

export default ImageNodeView;
