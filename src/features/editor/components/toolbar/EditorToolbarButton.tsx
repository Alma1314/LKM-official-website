import { memo } from "react";
import type { ReactNode } from "react";

interface EditorToolbarButtonProps {
  icon: ReactNode;
  label: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

const EditorToolbarButton = memo(function EditorToolbarButton({
  icon,
  label,
  title,
  isActive,
  onClick,
}: EditorToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`rte-toolbar-btn ${isActive ? "is-active" : ""}`}
      title={title}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
    </button>
  );
});

export default EditorToolbarButton;
