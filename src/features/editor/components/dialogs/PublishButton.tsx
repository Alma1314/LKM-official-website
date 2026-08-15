import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { DocumentData, PersistenceAdapter } from '../../engine/types';
import ConfirmDialog from './ConfirmDialog';

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
          <button
            type="button"
            className="rte-btn rte-btn--sm text-success"
            onClick={handleUnpublish}
            title="已发布（点击取消发布）"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </button>
          <button
            type="button"
            className="rte-btn rte-btn--ghost rte-btn--xs text-error"
            onClick={handleArchive}
            title="归档"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="5" x="2" y="3" rx="1" />
              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
              <path d="M10 12h4" />
            </svg>
          </button>
        </div>
      ) : status === 'archived' ? (
        <button
          type="button"
          className="rte-btn rte-btn--ghost rte-btn--xs"
          onClick={handleUnpublish}
          title="已归档（点击恢复）"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="5" x="2" y="3" rx="1" />
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="m9 15 3-3 3 3" />
            <path d="M12 12v9" />
          </svg>
        </button>
      ) : (
        <div className="flex gap-1">
          <button
            type="button"
            className="rte-btn rte-btn--primary rte-btn--xs"
            onClick={handlePublish}
            title="发布"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
          <button
            type="button"
            className="rte-btn rte-btn--ghost rte-btn--xs text-error"
            onClick={handleArchive}
            title="归档"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="5" x="2" y="3" rx="1" />
              <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
              <path d="M10 12h4" />
            </svg>
          </button>
        </div>
      )}
      {archiveConfirmOpen && (
        <ConfirmDialog
          message="确定归档此文档？归档后不可编辑。"
          danger
          onConfirm={handleArchiveConfirmed}
          onCancel={() => setArchiveConfirmOpen(false)}
        />
      )}
    </>
  );
}
