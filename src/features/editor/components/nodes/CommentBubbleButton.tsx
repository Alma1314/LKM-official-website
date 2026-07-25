import type { Editor } from '@tiptap/core';

interface CommentBubbleButtonProps {
  editor: Editor;
  onClick: (from: number, to: number, text: string) => void;
}

export default function CommentBubbleButton({ editor, onClick }: CommentBubbleButtonProps) {
  const handleComment = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (text.trim()) {
      onClick(from, to, text);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-xs btn-ghost"
      title="添加评论"
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
