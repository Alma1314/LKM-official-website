import { memo } from 'react';
import type { ReactNode } from 'react';
import type { ReactElement } from 'react';
import { t } from '~/lib/i18n';

export interface CalloutViewProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children?: ReactNode;
}

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
  success: '✓',
};

const TYPE_LABELS: Record<string, string> = {
  info: 'editor.callout.info',
  warning: 'editor.callout.warning',
  error: 'editor.callout.error',
  success: 'editor.callout.success',
};

/** 展示用类型标签（无 title 时的占位，走 i18n） */
function typeLabel(type: string): string {
  const key = TYPE_LABELS[type] ?? 'editor.callout.info';
  return t(key as Parameters<typeof t>[0]);
}

/**
 * Callout 共享展示组件（纯展示、无 Tiptap 副作用），输出 .lkm-* 统一类名。
 * 被编辑器 node view、预览面板复用；样式见 main.css 的 .lkm-callout*。
 */
const CalloutView = memo(function CalloutView({ type = 'info', title, children }: CalloutViewProps): ReactElement {
  const icon = TYPE_ICONS[type] ?? TYPE_ICONS.info;

  return (
    <div className={`lkm-callout lkm-callout-${type}`}>
      <span className="lkm-callout-icon">{icon}</span>
      <div className="lkm-callout-body">
        {title ? <h4>{title}</h4> : <p>{typeLabel(type)}</p>}
        {children}
      </div>
    </div>
  );
});

export default CalloutView;
