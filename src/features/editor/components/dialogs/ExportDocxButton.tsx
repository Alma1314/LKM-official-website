import type { Editor } from "@tiptap/core";
import type { ReactElement } from "react";
import { t } from "~/lib/i18n";

export async function handleExportDocx(editor: Editor): Promise<void> {
  try {
    // docx 库约 1MB，动态 import 仅在点击导出时加载，避免打膨胀编辑器主包
    const { buildDocxBlob } = await import("../../engine/serialize-docx");
    const json = editor.getJSON();
    const content = (json?.content ?? []) as unknown as Parameters<
      typeof buildDocxBlob
    >[0];
    // 用文档首标题作为默认文件名与文档标题
    const titleText = firstHeadingText(content) || t("editor.untitled");
    const blob = await buildDocxBlob(content, titleText);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameSafe(titleText)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.warn("[DocumentEditor] 导出 docx 失败:", err);
    alert(t("editor.exportFailed", { message: (err as Error).message }));
  }
}

/** 从顶层节点取首个标题文本，用作文件名 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function firstHeadingText(content: any[]): string {
  for (const node of content) {
    if (node?.type === "heading" && Array.isArray(node.content)) {
      const text = node.content
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((c: any) => c.text ?? "")
        .join("");
      if (text.trim()) return text.trim();
    }
  }
  return "";
}

/** 移除不适合做文件名的字符 */
function filenameSafe(name: string): string {
  return (
    name
      .trim()
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "_") || "document"
  );
}

interface ExportDocxButtonProps {
  editor: Editor;
}

export default function ExportDocxButton({
  editor,
}: ExportDocxButtonProps): ReactElement {
  return (
    <button
      type="button"
      className="rte-btn rte-btn--ghost rte-btn--xs"
      title={t("editor.exportDocxTitle")}
      onClick={() => {
        void handleExportDocx(editor);
      }}
    >
      DOCX
    </button>
  );
}
