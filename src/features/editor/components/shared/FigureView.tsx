import { memo } from 'react';
import type { ReactElement } from 'react';

export interface FigureViewProps {
  src?: string;
  alt?: string;
  caption?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

/**
 * Figure 共享展示组件（纯展示、无 Tiptap 副作用），输出 .lkm-* 统一类名。
 * 被编辑器 node view、预览面板复用；样式见 main.css 的 .lkm-figure*。
 */
const FigureView = memo(function FigureView({
  src,
  alt,
  caption,
  width,
  align = 'center',
}: FigureViewProps): ReactElement {
  return (
    <figure className={`lkm-figure lkm-figure-${align}`}>
      {src ? (
        <img src={src} alt={alt ?? ''} style={width ? { width: `${width}px` } : undefined} />
      ) : (
        <span className="lkm-figure-placeholder">暂无图片</span>
      )}
      {caption && <figcaption className="lkm-figure-caption">{caption}</figcaption>}
    </figure>
  );
});

export default FigureView;
