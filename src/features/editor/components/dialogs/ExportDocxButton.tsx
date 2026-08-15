import type { Editor } from '@tiptap/core';
import type { ReactElement } from 'react';
import { serializeHtml } from '../../engine/serialize-html';

export function handleExportDocx(editor: Editor): void {
  try {
    const json = editor.getJSON();
    const content = (json?.content ?? []) as Parameters<typeof serializeHtml>[0];
    const html = serializeHtml(content);

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

export default function ExportDocxButton({ editor }: ExportDocxButtonProps): ReactElement {
  return (
    <button
      type="button"
      className="rte-btn rte-btn--ghost rte-btn--xs"
      title="导出 Word 文档"
      onClick={() => handleExportDocx(editor)}
    >
      DOC
    </button>
  );
}
