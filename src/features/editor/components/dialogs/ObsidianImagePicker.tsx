import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

interface Props {
  onSelect: (file: File | null) => void;
}

/** 隐藏文件选择器：弹一次选一张图。onSelect(null) 表示取消。 */
export default function ObsidianImagePicker({ onSelect }: Props): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.click();
  }, []);
  return (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files?.[0] ?? null;
        onSelect(file);
      }}
    />
  );
}
