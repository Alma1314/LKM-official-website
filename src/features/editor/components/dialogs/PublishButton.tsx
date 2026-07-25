import type { DocumentData } from '../../engine/types';
import { updateDocument, getDocument } from '../../stores/document-api';

interface PublishButtonProps {
  documentId: string;
  onStatusChange: () => void;
  onOpenPublishDialog: () => void;
}

export default function PublishButton({ documentId, onStatusChange, onOpenPublishDialog }: PublishButtonProps) {
  const doc = getDocument(documentId);
  if (!doc) return null;

  const handlePublish = () => {
    onOpenPublishDialog();
  };

  const handleUnpublish = () => {
    const result = updateDocument(documentId, { ...doc, status: 'draft' });
    if (result.ok && result.value) {
      onStatusChange();
    }
  };

  const handleArchive = () => {
    if (!window.confirm('确定归档此文档？归档后不可编辑。')) return;
    const result = updateDocument(documentId, { ...doc, status: 'archived' });
    if (result.ok && result.value) {
      onStatusChange();
    }
  };

  const status = doc.status as DocumentData['status'];

  if (status === 'published') {
    return (
      <div className="flex gap-1">
        <button type="button" className="btn btn-success btn-xs btn-outline" onClick={handleUnpublish}>
          已发布
        </button>
        <button type="button" className="btn btn-ghost btn-xs text-error" onClick={handleArchive}>
          归档
        </button>
      </div>
    );
  }

  if (status === 'archived') {
    return (
      <button type="button" className="btn btn-ghost btn-xs" onClick={handleUnpublish}>
        已归档 — 点击恢复
      </button>
    );
  }

  return (
    <div className="flex gap-1">
      <button type="button" className="btn btn-primary btn-xs" onClick={handlePublish}>
        发布
      </button>
      <button type="button" className="btn btn-ghost btn-xs text-error" onClick={handleArchive}>
        归档
      </button>
    </div>
  );
}
