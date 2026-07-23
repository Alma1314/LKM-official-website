import { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/core';

interface LinkEditPopoverProps {
  editor: Editor;
  onClose: () => void;
}

export default function LinkEditPopover({ editor, onClose }: LinkEditPopoverProps) {
  const [href, setHref] = useState('');
  const [text, setText] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor) {
      const attrs = editor.getAttributes('link');
      setHref(attrs.href ?? '');
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');
      setText((selectedText || attrs.href) ?? '');
    }
  }, [editor]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (href) {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    onClose();
  };

  const handleRemove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  return (
    <div ref={popoverRef} className="absolute z-30 bg-base-100 border border-base-300 rounded-lg shadow-lg p-3 w-80">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-medium text-base-content/70">链接地址</label>
        <input
          type="url"
          className="input input-bordered input-sm"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://..."
          autoFocus
        />
        <label className="text-xs font-medium text-base-content/70">显示文本</label>
        <input
          type="text"
          className="input input-bordered input-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="链接文字"
        />
        <div className="flex justify-between mt-1">
          <button type="button" className="btn btn-ghost btn-sm text-error" onClick={handleRemove}>
            移除链接
          </button>
          <button type="submit" className="btn btn-primary btn-sm">
            确认
          </button>
        </div>
      </form>
    </div>
  );
}
