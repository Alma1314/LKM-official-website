import type { ReactNode } from 'react';

interface EditorToolbarButtonProps {
  icon: ReactNode;
  label: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

export default function EditorToolbarButton({ icon, label, title, isActive, onClick }: EditorToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm gap-1 ${isActive ? 'btn-active text-primary' : ''}`}
      title={title}
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
    >
      {icon}
      <span className="hidden lg:inline text-xs">{label}</span>
    </button>
  );
}
