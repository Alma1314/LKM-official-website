import sanitizeHtml from 'sanitize-html';

/**
 * 统一的内容 HTML 消毒配置：允许常用富文本标签，外加 img 及必要属性。
 * 所有渲染后端返回 HTML 内容的入口都必须经过本函数，防止 XSS。
 */
export function sanitizeHtmlContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
  });
}
