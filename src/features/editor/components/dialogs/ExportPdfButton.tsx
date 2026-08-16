import { createRoot } from "react-dom/client";
import { createElement } from "react";
import type { ReactElement } from "react";
import ExportPdfPage from "./ExportPdfPage";
import type { Editor } from "@tiptap/core";
import { t } from "~/lib/i18n";

export function handleExportPdf(editor: Editor): void {
  const json = editor.getJSON();
  const content = (json?.content ?? []) as Array<Record<string, unknown>>;

  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert(t("editor.exportPdfAllowPopup"));
    return;
  }

  printWindow.document.documentElement.innerHTML = `<head><meta charset="utf-8"><title>${t("editor.exportPdfTitle")}</title></head><body><div id="pdf-root"></div></body>`;

  setTimeout(() => {
    const rootEl = printWindow.document.getElementById("pdf-root");
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

export default function ExportPdfButton({
  editor,
}: ExportPdfButtonProps): ReactElement {
  return (
    <button
      type="button"
      className="rte-btn rte-btn--ghost rte-btn--xs"
      title={t("editor.exportPdf")}
      onClick={() => handleExportPdf(editor)}
    >
      PDF
    </button>
  );
}
