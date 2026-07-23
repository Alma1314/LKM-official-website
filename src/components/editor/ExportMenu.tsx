import { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import { handleExportPdf } from './ExportPdfButton';
import { handleExportDocx } from './ExportDocxButton';

interface ExportMenuProps {
  editor: Editor;
}

export default function ExportMenu({ editor }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={`btn btn-ghost btn-xs gap-1 ${open ? 'btn-active' : ''}`}
        onClick={() => setOpen(!open)}
        title="导出"
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        <span className="hidden lg:inline text-xs">导出</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-base-200 border border-base-300 rounded-lg shadow-lg p-1 min-w-[140px]">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-base-300/50 transition-colors"
            onClick={() => {
              handleExportPdf(editor);
              setOpen(false);
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            导出 PDF
          </button>
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded hover:bg-base-300/50 transition-colors"
            onClick={() => {
              handleExportDocx(editor);
              setOpen(false);
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
              <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M3 15h6" />
              <path d="M6 12v6" />
            </svg>
            导出 Word
          </button>
        </div>
      )}
    </div>
  );
}
