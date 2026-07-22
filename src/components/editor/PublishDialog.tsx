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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-base-100 border border-base-300 rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">发布文档</h3>

        <label className="text-sm font-medium block mb-1">标题</label>
        <input
          type="text"
          className="input input-bordered w-full mb-3"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="文档标题"
          autoFocus
        />

        <label className="text-sm font-medium block mb-1">永久链接</label>
        <div className="flex items-center gap-0 mb-3">
          <span className="text-sm text-base-content/50 bg-base-200 px-2 py-1 rounded-l border border-base-300 border-r-0">
            /docs/
          </span>
          <input
            type="text"
            className="input input-bordered w-full rounded-l-none"
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

        <p className="text-xs text-base-content/50 mb-4">发布后文档将公开可见。</p>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
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
