/**
 * 编辑器的 MDX 导出转 HTML 预处理器（官方文章页专用）。
 *
 * 背景：编辑器把 Callout/Figure 导出为**自闭合 JSX 空元素**：
 *   `<Callout type="warning" />`、`<Figure src alt caption width align />`
 * 但官方文章页用 `createMarkdownProcessor()`（markdown 处理），不解析 MDX JSX，
 * 会把 `<Callout/>`/`<Figure/>` 当成**未闭合的 HTML 容器标签**，嵌套吞掉后续正文，
 * 导致结构损坏。因此需在喂给 processor 之前，把这两类自闭合标签转成闭合良好的
 * `.lkm-*` HTML（类名与全站共享 Callout/Figure 样式一致，见 main.css）。
 *
 * 只处理编辑器导出的自闭合空元素形态。
 */

const CALLOUT_ICONS = {
  info: 'ℹ',
  warning: '⚠',
  error: '✕',
  success: '✓',
};
const CALLOUT_LABELS = {
  info: '信息',
  warning: '警告',
  error: '错误',
  success: '成功',
};

/** 自闭合 Callout：`<Callout  attrs  />`（attrs 内不再含 `>`） */
const CALLOUT_SELF = /<Callout\s+([^>]*?)\/>/g;
/** 自闭合 Figure：`<Figure  attrs  />` */
const FIGURE_SELF = /<Figure\s+([^>]*?)\/>/g;

/**
 * 把 content 中 `<Callout ... />` / `<Figure ... />` 转为 .lkm-* HTML。
 * @param {string} md - 编辑器导出的 MDX 原文
 * @returns {string} 转换后可被 markdown processor 正确解析的内容
 */
export function preprocessEditorMdx(md) {
  return md
    .replace(CALLOUT_SELF, (_match, attrsStr) => {
      const type = parseAttr(attrsStr, 'type') || 'info';
      const title = parseAttr(attrsStr, 'title');
      const body = title ? `<h4>${title}</h4>` : `<p>${CALLOUT_LABELS[type] || type}</p>`;
      return (
        `<div class="lkm-callout lkm-callout-${type}">` +
        `<span class="lkm-callout-icon">${CALLOUT_ICONS[type] || CALLOUT_ICONS.info}</span>` +
        `<div class="lkm-callout-body">${body}</div>` +
        `</div>`
      );
    })
    .replace(FIGURE_SELF, (_match, attrsStr) => {
      const align = parseAttr(attrsStr, 'align') || 'center';
      const src = parseAttr(attrsStr, 'src');
      const caption = parseAttr(attrsStr, 'caption');
      const width = parseAttr(attrsStr, 'width');
      const widthAttr = width ? ` style="width:${width}px"` : '';
      const img = src
        ? `<img src="${src}" alt="${parseAttr(attrsStr, 'alt') || ''}"${widthAttr} />`
        : `<span class="lkm-figure-placeholder">暂无图片</span>`;
      const captionHtml = caption ? `<figcaption class="lkm-figure-caption">${caption}</figcaption>` : '';
      return `<figure class="lkm-figure lkm-figure-${align}">${img}${captionHtml}</figure>`;
    });
}

/**
 * 从 JSX 属性串中取单个属性值，如取 type：`type="warning" title="x"` -> 'warning'。
 * @param {string} attrsStr
 * @param {string} name
 * @returns {string} 属性值（不存在返回 ''）
 */
function parseAttr(attrsStr, name) {
  const re = new RegExp(`\\b${name}=("([^"]*)"|'([^']*)')`);
  const m = re.exec(attrsStr);
  if (!m) return '';
  return m[2] ?? m[3] ?? '';
}

export default preprocessEditorMdx;
