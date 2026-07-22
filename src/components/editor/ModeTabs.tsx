import type { EditorMode } from '~/editor/types';

interface ModeTabsProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const TABS: { mode: EditorMode; label: string }[] = [
  { mode: 'richtext', label: '富文本' },
  { mode: 'source', label: '源码' },
  { mode: 'preview', label: '预览' },
];

export default function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex items-center gap-0 border-l border-base-300 pl-3 ml-2">
      <div className="tabs tabs-boxed tabs-sm">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            type="button"
            className={`tab tab-sm ${mode === tab.mode ? 'tab-active' : ''}`}
            onClick={() => onModeChange(tab.mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
