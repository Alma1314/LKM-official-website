import { memo } from 'react';
import type { ReactElement } from 'react';
import type { EditorMode } from '../../engine/types';
import { t } from '~/lib/i18n';

interface ModeTabsProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const TABS: { mode: EditorMode; label: string }[] = [
  { mode: 'richtext', label: t('editor.modeRichtext') },
  { mode: 'source', label: t('editor.modeSource') },
  { mode: 'preview', label: t('editor.modePreview') },
];

function ModeIcon({ mode }: { mode: EditorMode }): ReactElement {
  if (mode === 'source') {
    return (
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
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    );
  }
  if (mode === 'preview') {
    return (
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
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
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
      <line x1="21" x2="3" y1="6" y2="6" />
      <line x1="15" x2="3" y1="12" y2="12" />
      <line x1="17" x2="3" y1="18" y2="18" />
    </svg>
  );
}

const ModeTabs = memo(function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex items-center gap-0 border-l border-surface-3 pl-3 ml-2">
      <div className="rte-mode-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            type="button"
            className={`rte-mode-tab ${mode === tab.mode ? 'is-active' : ''}`}
            onClick={() => onModeChange(tab.mode)}
            title={tab.label}
          >
            <ModeIcon mode={tab.mode} />
          </button>
        ))}
      </div>
    </div>
  );
});

export default ModeTabs;
