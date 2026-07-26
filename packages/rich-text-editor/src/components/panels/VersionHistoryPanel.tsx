import { useState, useEffect, memo } from 'react';
import type { PersistenceAdapter, VersionEntry } from '../../engine/types';

interface VersionHistoryPanelProps {
  documentId: string;
  adapter: PersistenceAdapter;
  onRestore: (version: VersionEntry) => void;
  onClose: () => void;
}

const VersionHistoryPanel = memo(function VersionHistoryPanel({
  documentId,
  adapter,
  onRestore,
  onClose,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionEntry | null>(null);

  useEffect(() => {
    const result = adapter.getVersions(documentId);
    // Handle both Promise and sync return
    if (result instanceof Promise) {
      result.then(setVersions);
    } else {
      setVersions(result);
    }
  }, [documentId, adapter]);

  const handleSelect = (version: number) => {
    const v = versions.find((ver) => ver.version === version);
    setSelectedVersion(v ?? null);
  };

  const handleRestore = () => {
    if (!selectedVersion) return;
    if (window.confirm(`确定恢复到版本 ${selectedVersion.version}？当前未保存的更改会丢失。`)) {
      onRestore(selectedVersion);
    }
  };

  return (
    <div className="rte-panel flex flex-col">
      <div className="flex items-center justify-between px-3 py-3 border-b border-surface-3">
        <h3 className="text-sm font-semibold">版本历史</h3>
        <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <p className="text-xs text-deep-text/50 px-3 py-4">暂无版本记录</p>
        ) : (
          versions.map((v) => (
            <button
              key={v.version}
              type="button"
              className={`w-full text-left px-3 py-2 border-b border-surface-3/50 text-xs transition-colors ${
                selectedVersion?.version === v.version
                  ? 'bg-primary/10 border-l-2 border-l-[var(--primary)]'
                  : 'hover:bg-page-bg border-l-2 border-l-transparent'
              }`}
              onClick={() => handleSelect(v.version)}
            >
              <div className="font-medium">v{v.version}</div>
              <div className="text-deep-text/50">{v.message}</div>
              <div className="text-deep-text/40">{new Date(v.createdAt).toLocaleString('zh-CN')}</div>
            </button>
          ))
        )}
      </div>

      {selectedVersion && (
        <div className="border-t border-surface-3 p-3">
          <pre className="text-xs bg-surface-3/50 rounded p-2 mb-2 overflow-x-auto max-h-32 whitespace-pre-wrap font-mono">
            {selectedVersion.contentMdx.slice(0, 300)}
            {selectedVersion.contentMdx.length > 300 ? '…' : ''}
          </pre>
          <button type="button" className="rte-btn rte-btn--primary rte-btn--xs w-full" onClick={handleRestore}>
            恢复此版本
          </button>
        </div>
      )}
    </div>
  );
});

export default VersionHistoryPanel;
