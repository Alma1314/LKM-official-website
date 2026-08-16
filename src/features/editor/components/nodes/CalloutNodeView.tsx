import { memo, useState, useEffect, useRef } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { t } from '~/lib/i18n';

interface CalloutNodeViewProps {
  node: Node;
  editor: Editor;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

const TYPE_LABELS: Record<string, string> = {
  info: t('editor.callout.info'),
  warning: t('editor.callout.warning'),
  error: t('editor.callout.error'),
  success: t('editor.callout.success'),
};

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
  success: '✓',
};

const CalloutNodeView = memo(function CalloutNodeView({
  node,
  editor,
  getPos,
  updateAttributes,
}: CalloutNodeViewProps) {
  const [editing, setEditing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const ctype = ((node.attrs.type as string) || 'info') as keyof typeof TYPE_LABELS;

  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent): void => {
      if (panelRef.current && !panelRef.current.contains(e.target as HTMLElement)) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing]);
  const title = (node.attrs.title as string) || '';

  const alertClass = {
    info: 'alert-info',
    warning: 'alert-warning',
    error: 'alert-error',
    success: 'alert-success',
  }[ctype];

  return (
    <div className="relative my-2" contentEditable={false} data-callout>
      <div className={`alert ${alertClass} cursor-pointer`} onClick={() => setEditing(!editing)}>
        <span className="text-lg">{TYPE_ICONS[ctype]}</span>
        <div>
          {title && <h4 className="font-semibold text-sm">{title}</h4>}
          <p className="text-sm opacity-80">{t('editor.callout.hintEdit', { type: TYPE_LABELS[ctype] })}</p>
        </div>
      </div>

      {editing && (
        <div
          ref={panelRef}
          className="absolute top-full left-0 mt-1 z-30 bg-page-bg border border-surface-3 rounded-lg shadow-lg p-3 w-64 max-w-[calc(100vw-2rem)]"
        >
          <label className="text-xs font-medium block mb-1">{t('editor.callout.type')}</label>
          <select
            className="rte-select rte-select--sm w-full mb-2"
            value={ctype}
            onChange={(e) => updateAttributes({ type: e.target.value })}
          >
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <label className="text-xs font-medium block mb-1">{t('editor.callout.titleOptional')}</label>
          <input
            type="text"
            className="rte-input rte-input--sm w-full mb-2"
            value={title}
            placeholder={t('editor.callout.titlePlaceholder')}
            onChange={(e) => updateAttributes({ title: e.target.value })}
          />
          <div className="flex gap-1 justify-end">
            <button
              type="button"
              className="rte-btn rte-btn--ghost rte-btn--xs text-error"
              onMouseDown={(e) => {
                e.preventDefault();
                const pos = getPos();
                if (pos !== undefined) {
                  editor
                    .chain()
                    .focus()
                    .deleteRange({ from: pos, to: pos + node.nodeSize })
                    .run();
                }
              }}
            >
              {t('editor.delete')}
            </button>
            <button
              type="button"
              className="rte-btn rte-btn--primary rte-btn--xs"
              onMouseDown={(e) => {
                e.preventDefault();
                setEditing(false);
              }}
            >
              {t('editor.confirm')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default CalloutNodeView;
