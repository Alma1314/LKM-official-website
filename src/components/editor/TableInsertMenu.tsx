import { useState } from 'react';

interface TableInsertMenuProps {
  onInsert: (rows: number, cols: number) => void;
  onClose: () => void;
}

const MAX_ROWS = 8;
const MAX_COLS = 8;

export default function TableInsertMenu({ onInsert, onClose }: TableInsertMenuProps) {
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);

  return (
    <div className="absolute top-full left-0 mt-2 z-30 bg-base-200 border border-base-300 rounded-lg shadow-lg p-3">
      <p className="text-xs text-base-content/60 mb-2">
        {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} × ${hoverCol} 表格` : '选择表格尺寸'}
      </p>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 24px)` }}
        onMouseLeave={() => {
          setHoverRow(0);
          setHoverCol(0);
        }}
      >
        {Array.from({ length: MAX_ROWS }, (_, r) =>
          Array.from({ length: MAX_COLS }, (_, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-6 h-6 rounded border cursor-pointer transition-colors ${
                r < hoverRow && c < hoverCol ? 'bg-primary/40 border-primary' : 'bg-base-300/50 border-base-content/20'
              }`}
              onMouseEnter={() => {
                setHoverRow(r + 1);
                setHoverCol(c + 1);
              }}
              onClick={() => {
                onInsert(hoverRow, hoverCol);
                onClose();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
