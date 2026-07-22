import { useState, useCallback } from 'react';

interface MathEditorProps {
  initialLatex: string;
  isBlock: boolean;
  onConfirm: (latex: string) => void;
  onCancel: () => void;
}

export default function MathEditor({ initialLatex, isBlock, onConfirm, onCancel }: MathEditorProps) {
  const [latex, setLatex] = useState(initialLatex);

  const handleConfirm = useCallback(() => {
    onConfirm(latex || initialLatex);
  }, [latex, initialLatex, onConfirm]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleConfirm();
      }
    },
    [handleConfirm]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-base-100 border border-base-300 rounded-xl shadow-2xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">{isBlock ? '块级公式' : '行内公式'}</h3>

        <div className="mb-4">
          <label className="text-sm font-medium text-base-content/70 block mb-1">LaTeX 公式</label>
          <textarea
            className="textarea textarea-bordered w-full font-mono text-sm"
            rows={3}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如: E=mc^2 或 \frac{-b\pm\sqrt{b^2-4ac}}{2a}"
            autoFocus
          />
          <p className="text-xs text-base-content/50 mt-1">Ctrl+Enter 确认</p>
        </div>

        {isBlock && latex && (
          <div className="mb-4 p-4 bg-base-200 rounded-lg flex items-center justify-center min-h-[60px]">
            <span id="math-preview" className="text-lg" />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
