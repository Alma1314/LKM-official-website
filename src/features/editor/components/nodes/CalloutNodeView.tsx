import { memo, useState, useEffect, useRef } from 'react';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { t } from '~/lib/i18n';
import CalloutView from '../shared/CalloutView';

interface CalloutNodeViewProps {
  node: Node;
  editor: Editor;
  getPos: () => number | undefined;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

/** option 标签 key（值走 i18n 展示） */
const TYPE_LABEL_KEYS: Record<string, string> = {
  info: 'editor.callout.info',
  warning: 'editor.callout.warning',
  error: 'editor.callout.error',
  success: 'editor.callout.success',
};

function typeLabel(type: string): string {
  return t((TYPE_LABEL_KEYS[type] ?? 'editor.callout.info') as Parameters<typeof t>[0]);
}

const CalloutNodeView = memo(function CalloutNodeView({
  node,
  editor,
  getPos,
  updateAttributes,
}: CalloutNodeViewProps) {
  const [editing, setEditing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const ctype = ((node.attrs.type as string) || 'info') as 'info' | 'warning' | 'error' | 'success';

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

  return (
    <NodeViewWrapper className="relative my-2" contentEditable={false} data-callout>
      <div className="cursor-pointer" onClick={() => setEditing(!editing)}>
        <CalloutView type={ctype} title={title || undefined} />
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
            {Object.keys(TYPE_LABEL_KEYS).map((k) => (
              <option key={k} value={k}>
                {typeLabel(k)}
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
    </NodeViewWrapper>
  );
});

export default CalloutNodeView;
