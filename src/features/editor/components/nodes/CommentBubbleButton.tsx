import type { Editor } from "@tiptap/core";
import type { ReactElement } from "react";
import { t } from "~/lib/i18n";

interface CommentBubbleButtonProps {
  editor: Editor;
  onClick: (from: number, to: number, text: string) => void;
}

export default function CommentBubbleButton({
  editor,
  onClick,
}: CommentBubbleButtonProps): ReactElement {
  const handleComment = (): void => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, " ");
    if (text.trim()) {
      onClick(from, to, text);
    }
  };

  return (
    <button
      type="button"
      className="rte-toolbar-btn"
      title={t("editor.addComment")}
      onMouseDown={(e) => {
        e.preventDefault();
        handleComment();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
