import { memo } from 'react';
import type { ReactNode } from 'react';
import type { ReactElement } from 'react';

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
  info: '信息',
  warning: '警告',
  error: '错误',
  success: '成功',
};

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
        {title ? <h4>{title}</h4> : <p>{TYPE_LABELS[type] ?? type}</p>}
        {children}
      </div>
    </div>
  );
});

export default CalloutView;
