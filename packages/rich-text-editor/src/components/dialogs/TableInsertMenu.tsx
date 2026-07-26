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
    <div className="rte-link-popover">
      <p className="text-xs text-deep-text/60 mb-2">
        {hoverRow > 0 && hoverCol > 0 ? `${hoverRow} × ${hoverCol} 表格` : '选择表格尺寸'}
      </p>
      <div
        className="rte-table-menu"
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
              className={`rte-table-cell ${r < hoverRow && c < hoverCol ? 'is-active' : ''}`}
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
