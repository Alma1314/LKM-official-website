import { useState, useRef, useEffect } from 'react';

interface InlineInputProps {
  placeholder?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function InlineInput({ placeholder, defaultValue = '', onConfirm, onCancel }: InlineInputProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onCancel]);

  const handleSubmit = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div ref={containerRef} className="flex items-center gap-1 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1">
      <input
        ref={inputRef}
        type="text"
        className="input input-bordered input-xs w-40"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <button type="button" className="btn btn-xs btn-primary" onClick={handleSubmit}>
        确定
      </button>
      <button type="button" className="btn btn-xs btn-ghost" onClick={onCancel}>
        ×
      </button>
    </div>
  );
}
