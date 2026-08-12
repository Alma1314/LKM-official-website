import { useState, useCallback, useRef, useEffect } from 'react';
import katex from 'katex';

interface MathEditorProps {
  initialLatex: string;
  isBlock: boolean;
  onConfirm: (latex: string) => void;
  onCancel: () => void;
}

export default function MathEditor({ initialLatex, isBlock, onConfirm, onCancel }: MathEditorProps) {
  const [latex, setLatex] = useState(initialLatex);
  const previewRef = useRef<HTMLSpanElement>(null);

  const handleConfirm = useCallback(() => {
    onConfirm(latex || initialLatex);
  }, [latex, initialLatex, onConfirm]);

  // 实时渲染 KaTeX 预览
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const tex = latex.trim();
    if (!tex) {
      el.innerHTML = '<span class="text-deep-text/30 text-sm italic">输入公式后这里预览</span>';
      return;
    }
    try {
      el.innerHTML = katex.renderToString(tex, { displayMode: isBlock, throwOnError: false });
    } catch (err) {
      console.warn('[MathEditor] KaTeX 渲染失败:', err);
      el.innerHTML = '<span class="text-error text-sm">LaTeX 语法错误</span>';
    }
  }, [latex, isBlock]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        handleConfirm();
      }
    },
    [handleConfirm]
  );

  return (
    <div className="rte-dialog-backdrop" onClick={onCancel}>
      <div className="rte-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{isBlock ? '块级公式' : '行内公式'}</h3>

        <div className="mb-4">
          <label className="text-sm font-medium text-deep-text/70 block mb-1">LaTeX 公式</label>
          <textarea
            className="rte-textarea w-full font-mono text-sm"
            rows={3}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如: E=mc^2 或 \frac{-b\pm\sqrt{b^2-4ac}}{2a}"
            autoFocus
          />
          <p className="text-xs text-deep-text/50 mt-1">Ctrl+Enter 确认</p>
        </div>

        <div className="mb-4 p-4 bg-page-bg rounded-lg flex items-center justify-center min-h-[60px]">
          <span ref={previewRef} className="text-lg" />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="rte-btn rte-btn--primary rte-btn--sm" onClick={handleConfirm}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
