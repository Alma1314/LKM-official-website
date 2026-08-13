import { useState } from 'react';
import type { ReactElement } from 'react';

interface ImageUrlPopoverProps {
  onInsert: (src: string, alt: string) => void;
  onClose: () => void;
}

export default function ImageUrlPopover({ onInsert, onClose }: ImageUrlPopoverProps): ReactElement {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>): void => {
    e.preventDefault();
    const trimmed = src.trim();
    if (trimmed) {
      onInsert(trimmed, alt.trim());
    }
  };

  return (
    <div className="rte-dialog-backdrop" onClick={onClose}>
      <div className="rte-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">插入图片</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label className="text-sm font-medium text-deep-text/70 block mb-1">图片地址</label>
          <input
            type="url"
            className="rte-input"
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder="https://..."
            autoFocus
          />
          <label className="text-sm font-medium text-deep-text/70 block mb-1">替代文本 (alt)</label>
          <input
            type="text"
            className="rte-input"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="图片描述"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="rte-btn rte-btn--primary rte-btn--sm" disabled={!src.trim()}>
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
