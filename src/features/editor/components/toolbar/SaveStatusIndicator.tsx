import { memo } from 'react';
import type { SaveStatus } from '../../engine/types';

const STATUS_CONFIG: Record<SaveStatus, { label: string; className: string; dot: string }> = {
  saved: { label: '已保存', className: 'rte-save-status--saved', dot: '' },
  unsaved: { label: '有未保存更改', className: 'rte-save-status--unsaved', dot: 'animate-pulse' },
  saving: { label: '正在保存……', className: 'rte-save-status--saving', dot: '' },
  error: { label: '保存失败', className: 'rte-save-status--error', dot: '' },
  conflict: { label: '版本冲突', className: 'rte-save-status--error', dot: '' },
};

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  charCount?: number;
  wordCount?: number;
}

const SaveStatusIndicator = memo(function SaveStatusIndicator({
  status,
  charCount,
  wordCount,
}: SaveStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 text-xs px-1">
      {wordCount !== undefined && <span>{wordCount} 字</span>}
      {charCount !== undefined && <span>{charCount} 字符</span>}
      <span className={`rte-save-status ${config.className} gap-1`}>
        {config.dot && <span className={`inline-block w-1.5 h-1.5 rounded-full bg-current ${config.dot}`} />}
        {config.label}
      </span>
    </div>
  );
});
export default SaveStatusIndicator;
