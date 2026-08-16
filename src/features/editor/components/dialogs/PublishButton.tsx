import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { DocumentData, PersistenceAdapter } from '../../engine/types';
import ConfirmDialog from './ConfirmDialog';
import { t } from '~/lib/i18n';

interface PublishButtonProps {
  documentId: string;
  adapter: PersistenceAdapter;
  onStatusChange: () => void;
  onOpenPublishDialog: () => void;
}

export default function PublishButton({
  documentId,
  adapter,
  onStatusChange,
  onOpenPublishDialog,
}: PublishButtonProps): ReactElement | null {
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const adapterRef = useRef(adapter);
  adapterRef.current = adapter;

  useEffect(() => {
    const result = adapterRef.current.loadDocument(documentId);
    if (result instanceof Promise) {
      result.then((d) => setDoc(d ?? null));
    } else {
      setDoc(result ?? null);
    }
  }, [documentId]);

  if (!doc) return null;

  const handlePublish = (): void => {
    onOpenPublishDialog();
  };

  const handleUnpublish = (): void => {
    const result = adapter.saveDocument({ ...doc, status: 'draft' });
    if (result instanceof Promise) {
      result.then((ok) => {
        if (ok !== false) onStatusChange();
      });
    } else if (result !== false) {
      onStatusChange();
    }
  };

  const handleArchive = (): void => {
    setArchiveConfirmOpen(true);
  };

  const handleArchiveConfirmed = (): void => {
    setArchiveConfirmOpen(false);
    const result = adapter.saveDocument({ ...doc, status: 'archived' });
    if (result instanceof Promise) {
      result.then((ok) => {
        if (ok !== false) onStatusChange();
      });
    } else if (result !== false) {
      onStatusChange();
    }
  };

  const status = doc.status as DocumentData['status'];

  return (
    <>
      {status === 'published' ? (
        <div className="flex gap-1">
          <button type="button" className="rte-btn rte-btn--sm text-success" onClick={handleUnpublish}>
            {t('editor.published')}
          </button>
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs text-error" onClick={handleArchive}>
            {t('editor.archive')}
          </button>
        </div>
      ) : status === 'archived' ? (
        <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs" onClick={handleUnpublish}>
          {t('editor.archivedClickToRestore')}
        </button>
      ) : (
        <div className="flex gap-1">
          <button type="button" className="rte-btn rte-btn--primary rte-btn--xs" onClick={handlePublish}>
            {t('editor.publish')}
          </button>
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs text-error" onClick={handleArchive}>
            {t('editor.archive')}
          </button>
        </div>
      )}
      {archiveConfirmOpen && (
        <ConfirmDialog
          message={t('editor.confirmArchiveMessage')}
          danger
          onConfirm={handleArchiveConfirmed}
          onCancel={() => setArchiveConfirmOpen(false)}
        />
      )}
    </>
  );
}
