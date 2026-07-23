import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import ExportPdfPage from './ExportPdfPage';
import type { Editor } from '@tiptap/core';

export function handleExportPdf(editor: Editor): void {
  const json = editor.getJSON();
  const content = (json?.content ?? []) as Array<Record<string, unknown>>;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('请允许弹出窗口以导出 PDF');
    return;
  }

  printWindow.document.open();
  printWindow.document.writeln(
    '<!DOCTYPE html><html><head><meta charset="utf-8"><title>导出 PDF</title></head><body><div id="pdf-root"></div></body></html>'
  );
  printWindow.document.close();

  setTimeout(() => {
    const rootEl = printWindow.document.getElementById('pdf-root');
    if (rootEl) {
      const root = createRoot(rootEl);
      root.render(createElement(ExportPdfPage, { content }));
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }, 300);
}

interface ExportPdfButtonProps {
  editor: Editor;
}

export default function ExportPdfButton({ editor }: ExportPdfButtonProps) {
  return (
    <button type="button" className="btn btn-ghost btn-xs" title="导出 PDF" onClick={() => handleExportPdf(editor)}>
      PDF
    </button>
  );
}
