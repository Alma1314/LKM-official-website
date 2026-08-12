import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { DocumentData, PersistenceAdapter } from '../../engine/types';

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
    if (!window.confirm('确定归档此文档？归档后不可编辑。')) return;
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

  if (status === 'published') {
    return (
      <div className="flex gap-1">
        <button type="button" className="rte-btn rte-btn--sm text-success" onClick={handleUnpublish}>
          已发布
        </button>
        <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs text-error" onClick={handleArchive}>
          归档
        </button>
      </div>
    );
  }

  if (status === 'archived') {
    return (
      <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs" onClick={handleUnpublish}>
        已归档 — 点击恢复
      </button>
    );
  }

  return (
    <div className="flex gap-1">
      <button type="button" className="rte-btn rte-btn--primary rte-btn--xs" onClick={handlePublish}>
        发布
      </button>
      <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs text-error" onClick={handleArchive}>
        归档
      </button>
    </div>
  );
}
