import type { ReactElement } from 'react';

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  message,
  confirmLabel = '确认',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactElement {
  return (
    <div className="rte-dialog-backdrop" onClick={onCancel}>
      <div className="rte-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">确认操作</h3>
        <p className="text-sm text-deep-text/80 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`rte-btn rte-btn--sm ${danger ? 'rte-btn--ghost text-error' : 'rte-btn--primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
