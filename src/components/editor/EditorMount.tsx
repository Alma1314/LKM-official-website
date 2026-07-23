import { useEffect, useState } from 'react';
import DocumentEditor from './DocumentEditor';

function getDocumentId(): string {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) return id;
  const hash = window.location.hash.slice(1);
  if (hash) return hash;
  return 'new';
}

export default function EditorMount() {
  const [docId, setDocId] = useState<string | null>(null);

  useEffect(() => {
    setDocId(getDocumentId());
  }, []);

  if (!docId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] border border-base-300 rounded-lg bg-base-100">
        <span className="loading loading-spinner loading-md mr-2"></span>
        <span className="text-base-content/50">正在加载编辑器……</span>
      </div>
    );
  }

  return <DocumentEditor documentId={docId} />;
}
