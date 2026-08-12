import { useState, useRef, useEffect } from 'react';
import type { ReactElement } from 'react';

interface InlineInputProps {
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function InlineInput({ placeholder, defaultValue = '', onConfirm, onCancel }: InlineInputProps): ReactElement {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel]);

  const handleSubmit = (): void => {
    if (value.trim()) {
      onConfirm(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1 bg-page-bg border border-surface-3 rounded-lg shadow-lg p-1"
    >
      <input
        ref={inputRef}
        type="text"
        className="rte-input w-40"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button type="button" className="rte-btn rte-btn--primary rte-btn--xs" onClick={handleSubmit}>
        确定
      </button>
      <button type="button" className="rte-btn rte-btn--ghost rte-btn--xs" onClick={onCancel}>
        ×
      </button>
    </div>
  );
}
