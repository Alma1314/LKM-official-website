import type { DocumentData } from '~/editor/types';
import { updateDocument, getDocument } from '~/lib/document-api';
import { saveVersion } from '~/lib/version-store';

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
    const updated = updateDocument(documentId, { ...doc, status: 'draft' });
    if (updated) {
      saveVersion(documentId, updated, '取消发布');
      onStatusChange();
    }
  };

  const handleArchive = () => {
    if (!window.confirm('确定归档此文档？归档后不可编辑。')) return;
    const updated = updateDocument(documentId, { ...doc, status: 'archived' });
    if (updated) {
      saveVersion(documentId, updated, '归档');
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
