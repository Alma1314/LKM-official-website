import { useState } from 'react';

interface PublishDialogProps {
  currentTitle: string;
  onConfirm: (title: string, slug: string) => void;
  onCancel: () => void;
}

export default function PublishDialog({ currentTitle, onConfirm, onCancel }: PublishDialogProps) {
  const [title, setTitle] = useState(currentTitle || '');
  const [slug, setSlug] = useState(
    (currentTitle || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '')
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug || slug === 'untitled') {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  };

  return (
    <div className="rte-dialog-backdrop" onClick={onCancel}>
      <div className="rte-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">发布文档</h3>

        <label className="text-sm font-medium block mb-1">标题</label>
        <input
          type="text"
          className="rte-input w-full mb-3"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="文档标题"
          autoFocus
        />

        <label className="text-sm font-medium block mb-1">永久链接</label>
        <div className="flex items-center gap-0 mb-3">
          <span className="text-sm text-deep-text/50 bg-page-bg px-2 py-1 rounded-l border border-surface-3 border-r-0">
            /docs/
          </span>
          <input
            type="text"
            className="rte-input w-full rounded-l-none"
            value={slug}
            onChange={(e) =>
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '')
                  .slice(0, 80)
              )
            }
            placeholder="my-document"
          />
        </div>

        <p className="text-xs text-deep-text/50 mb-4">发布后文档将公开可见。</p>

        <div className="flex justify-end gap-2">
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className="rte-btn rte-btn--primary rte-btn--sm"
            disabled={!title.trim()}
            onClick={() => onConfirm(title.trim(), slug)}
          >
            确认发布
          </button>
        </div>
      </div>
    </div>
  );
}
