import type { ReactElement } from 'react';
import { t } from '~/lib/i18n';

interface ConfirmDialogProps {
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  message,
  confirmLabel = t('editor.confirm'),
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactElement {
  return (
    <div className="rte-dialog-backdrop" onClick={onCancel}>
      <div className="rte-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">{t('editor.confirmTitle')}</h3>
        <p className="text-sm text-deep-text/80 mb-6">{message}</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm" onClick={onCancel}>
            {t('editor.cancel')}
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
