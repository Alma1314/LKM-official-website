import { useState, useRef, useEffect, useCallback } from 'react';
import { listDocuments, createDocument, getDocument, autosave } from '~/lib/document-api';
import { exportAllToJson, importFromJson, getBackups, restoreFromBackup, saveBackup } from '~/lib/backup-store';
import type { BackupData, BackupMeta } from '~/lib/backup-store';

export default function BackupMenu() {
  const [open, setOpen] = useState(false);
  const [backups, setBackups] = useState<BackupMeta[]>([]);
  const [showBackups, setShowBackups] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowBackups(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleExport = useCallback(() => {
    const docs = listDocuments();
    if (docs.length === 0) {
      alert('暂无文档可导出');
      return;
    }
    const fullDocs = docs.map((meta) => {
      return getDocument(meta.id) || { id: meta.id, title: meta.title, contentMdx: '', editorJson: null, status: meta.status, version: meta.version, lastModified: meta.lastModified, createdAt: '', updatedAt: '' };
    });
    const json = exportAllToJson(fullDocs as BackupData[]);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lkm-docs-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }, []);

  const handleImport = useCallback(() => {
    setOpen(false);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = importFromJson(reader.result as string);
        if (data.length === 0) {
          alert('JSON 文件中没有文档数据');
          return;
        }
        const existing = listDocuments();
        if (existing.length > 0) {
          if (!confirm(`将导入 ${data.length} 个文档，当前 ${existing.length} 个文档将被覆盖。确定继续？`)) {
            return;
          }
        }
        for (const doc of data) {
          autosave(doc.docId, {
            contentMdx: doc.contentMdx,
            editorJson: doc.editorJson as Record<string, unknown>,
            baseVersion: 0,
          });
          saveBackup(doc.docId, doc);
        }
        alert(`成功导入 ${data.length} 个文档`);
        window.location.reload();
      } catch (err) {
        alert('导入失败: ' + (err instanceof Error ? err.message : '格式错误'));
      }
    };
    reader.readAsText(file);
  }, []);

  const handleShowBackups = useCallback(async () => {
    const list = await getBackups();
    setBackups(list);
    setShowBackups(true);
  }, []);

  const handleRestore = useCallback(async (docId: string, title: string) => {
    if (!confirm(`从备份恢复"${title}"？当前数据将被覆盖。`)) return;
    const backup = await restoreFromBackup(docId);
    if (backup) {
      const existing = listDocuments().find((d) => d.id === docId);
      if (!existing) {
        createDocument(backup.title);
      }
      autosave(docId, {
        contentMdx: backup.contentMdx,
        editorJson: backup.editorJson as Record<string, unknown>,
        baseVersion: 0,
      });
      setShowBackups(false);
      setOpen(false);
      alert(`已恢复文档"${title}"`);
      window.location.reload();
    } else {
      alert('未找到该文档的备份');
    }
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`btn btn-ghost btn-xs gap-1 ${open ? 'btn-active' : ''}`}
        onClick={() => { setOpen(!open); setShowBackups(false); }}
        title="备份管理"
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
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
        <span className="hidden lg:inline text-xs">备份</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && !showBackups && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1 min-w-[160px]">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-base-300/50 transition-colors"
            onClick={handleExport}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            导出所有文档
          </button>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-base-300/50 transition-colors"
            onClick={handleImport}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            导入文档
          </button>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-base-300/50 transition-colors"
            onClick={handleShowBackups}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
            从备份恢复
          </button>
        </div>
      )}

      {open && showBackups && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-base-200 border border-base-300 rounded-lg shadow-lg p-2 min-w-[260px] max-h-[300px] overflow-y-auto">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs text-base-content/70">可用备份 ({backups.length})</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setShowBackups(false)}
            >
              返回
            </button>
          </div>
          {backups.length === 0 ? (
            <p className="text-xs text-base-content/50 px-1 py-4 text-center">暂无备份</p>
          ) : (
            backups.map((b) => (
              <button
                key={b.id}
                type="button"
                className="flex items-center justify-between w-full px-2 py-1.5 text-xs rounded hover:bg-base-300/50 transition-colors"
                onClick={() => handleRestore(b.docId, b.title)}
              >
                <span className="truncate">{b.title}</span>
                <span className="text-base-content/50 shrink-0 ml-2">
                  {new Date(b.timestamp).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            ))
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
