import type { Editor } from '@tiptap/core';

export function handleExportDocx(editor: Editor): void {
  try {
    const json = editor.getJSON();
    const content = json?.content ?? [];
    const html = buildHtml(content as Record<string, unknown>[]);

    // Microsoft Word compatible HTML format
    const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Document</title><style>
  body { font-family: 'Noto Sans SC', sans-serif; font-size: 12pt; line-height: 1.8; }
  h1 { font-size: 20pt; } h2 { font-size: 16pt; } h3 { font-size: 14pt; }
  p { margin: 0.3em 0; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #666; }
  pre { background: #f5f5f5; padding: 1em; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #ddd; padding: 6px; }
</style></head>
<body>${html}</body>
</html>`;

    const blob = new Blob(['\ufeff' + wordHtml], {
      type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.doc';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('导出失败: ' + (err as Error).message);
  }
}

interface ExportDocxButtonProps {
  editor: Editor;
}

export default function ExportDocxButton({ editor }: ExportDocxButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-xs"
      title="导出 Word 文档"
      onClick={() => handleExportDocx(editor)}
    >
      DOC
    </button>
  );
}

function buildHtml(nodes: Array<Record<string, unknown>>): string {
  return nodes
    .map((node) => {
      const type = node.type as string;
      const text = (node.text as string) || '';
      const content = node.content as Array<Record<string, unknown>> | undefined;
      const attrs = (node.attrs ?? {}) as Record<string, string | number>;

      switch (type) {
        case 'paragraph':
          return `<p>${content ? buildHtml(content) : text}</p>`;
        case 'heading': {
          const level = Math.min(Math.max((attrs.level as number) || 1, 1), 6);
          return `<h${level}>${content ? buildHtml(content) : text}</h${level}>`;
        }
        case 'text': {
          let t = escapeHtml(text);
          const marks = (node.marks as Array<{ type: string; attrs?: Record<string, string> }>) ?? [];
          for (const m of marks) {
            if (m.type === 'bold') t = `<strong>${t}</strong>`;
            if (m.type === 'italic') t = `<em>${t}</em>`;
            if (m.type === 'underline') t = `<u>${t}</u>`;
            if (m.type === 'strike') t = `<del>${t}</del>`;
            if (m.type === 'code') t = `<code>${t}</code>`;
            if (m.type === 'link') t = `<a href="${escapeHtml(m.attrs?.href || '#')}">${t}</a>`;
          }
          return t;
        }
        case 'blockquote':
          return `<blockquote>${content ? buildHtml(content) : ''}</blockquote>`;
        case 'bulletList':
          return `<ul>${content ? buildHtml(content) : ''}</ul>`;
        case 'orderedList':
          return `<ol>${content ? buildHtml(content) : ''}</ol>`;
        case 'listItem':
        case 'taskItem':
          return `<li>${content ? buildHtml(content) : ''}</li>`;
        case 'codeBlock':
          return `<pre><code>${text}</code></pre>`;
        case 'horizontalRule':
          return '<hr />';
        case 'image':
          return `<img src="${escapeHtml((attrs.src as string) || '')}" alt="${escapeHtml((attrs.alt as string) || '')}" />`;
        case 'table':
          return `<table><tbody>${content ? buildHtml(content) : ''}</tbody></table>`;
        case 'tableRow':
          return `<tr>${content ? buildHtml(content) : ''}</tr>`;
        case 'tableCell':
          return `<td>${content ? buildHtml(content) : text}</td>`;
        case 'callout': {
          const ct = (attrs.type as string) || 'info';
          return `<div style="border:1px solid #ccc;padding:10px;border-radius:6px;background:${ct === 'warning' ? '#fff3cd' : '#e8f4fd'}">${attrs.title || ''}</div>`;
        }
        case 'figure':
          return `<figure><img src="${escapeHtml((attrs.src as string) || '')}" alt="${escapeHtml((attrs.alt as string) || '')}" />${attrs.caption ? `<figcaption>${attrs.caption}</figcaption>` : ''}</figure>`;
        case 'blockMath':
          return `<p class="text-center">$${attrs.latex || ''}$</p>`;
        default:
          return content ? buildHtml(content) : text;
      }
    })
    .join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
