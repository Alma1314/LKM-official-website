import { useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import ExportPdfPage from './ExportPdfPage';
import type { Editor } from '@tiptap/core';

interface ExportPdfButtonProps {
  editor: Editor;
}

export default function ExportPdfButton({ editor }: ExportPdfButtonProps) {
  const handleExport = useCallback(() => {
    const json = editor.getJSON();
    const content = (json?.content ?? []) as Array<Record<string, unknown>>;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('请允许弹出窗口以导出 PDF');
      return;
    }

    printWindow.document.write(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>导出 PDF</title></head><body><div id="pdf-root"></div></body></html>'
    );
    printWindow.document.close();

    // Wait for the window to be ready, then render and print
    setTimeout(() => {
      const rootEl = printWindow.document.getElementById('pdf-root');
      if (rootEl) {
        const root = createRoot(rootEl);
        root.render(createElement(ExportPdfPage, { content }));
        // Wait for render, then print
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }, 300);
  }, [editor]);

  return (
    <button type="button" className="btn btn-ghost btn-xs" title="导出 PDF" onClick={handleExport}>
      PDF
    </button>
  );
}
