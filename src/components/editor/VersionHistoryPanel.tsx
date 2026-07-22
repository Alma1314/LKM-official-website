import { useState, useEffect } from 'react';
import { getVersions, getVersion, type VersionEntry } from '~/lib/version-store';

interface VersionHistoryPanelProps {
  documentId: string;
  onRestore: (version: VersionEntry) => void;
  onClose: () => void;
}

export default function VersionHistoryPanel({ documentId, onRestore, onClose }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null);

  useEffect(() => {
    setVersions(getVersions(documentId));
  }, [documentId]);

  const handleSelect = (version: number) => {
    const v = getVersion(documentId, version);
    setSelectedVersion(v ?? null);
  };

  const handleRestore = () => {
    if (!selectedVersion) return;
    if (window.confirm(`确定恢复到版本 ${selectedVersion.version}？当前未保存的更改会丢失。`)) {
      onRestore(selectedVersion);
    }
  };

  return (
    <div className="w-72 border-l border-base-300 bg-base-200/50 flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b border-base-300">
        <h3 className="text-sm font-semibold">版本历史</h3>
        <button type="button" className="btn btn-ghost btn-xs" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <p className="text-xs text-base-content/50 px-3 py-4">暂无版本记录</p>
        ) : (
          versions.map((v) => (
            <button
              key={v.version}
              type="button"
              className={`w-full text-left px-3 py-2 border-b border-base-300/50 text-xs transition-colors ${
                selectedVersion?.version === v.version
                  ? 'bg-primary/10 border-l-2 border-l-primary'
                  : 'hover:bg-base-200 border-l-2 border-l-transparent'
              }`}
              onClick={() => handleSelect(v.version)}
            >
              <div className="font-medium">v{v.version}</div>
              <div className="text-base-content/50">{v.message}</div>
              <div className="text-base-content/40">{new Date(v.createdAt).toLocaleString('zh-CN')}</div>
            </button>
          ))
        )}
      </div>

      {selectedVersion && (
        <div className="border-t border-base-300 p-3">
          <pre className="text-xs bg-base-300/50 rounded p-2 mb-2 overflow-x-auto max-h-32 whitespace-pre-wrap font-mono">
            {selectedVersion.contentMdx.slice(0, 300)}
            {selectedVersion.contentMdx.length > 300 ? '…' : ''}
          </pre>
          <button type="button" className="btn btn-primary btn-xs w-full" onClick={handleRestore}>
            恢复此版本
          </button>
        </div>
      )}
    </div>
  );
}
