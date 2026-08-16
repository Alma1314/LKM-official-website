import { memo } from 'react';
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
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
});

export default ModeTabs;
