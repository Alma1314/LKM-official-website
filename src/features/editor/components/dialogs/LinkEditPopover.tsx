import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Editor } from '@tiptap/core';

interface LinkEditPopoverProps {
  editor: Editor;
  onClose: () => void;
}

export default function LinkEditPopover({ editor, onClose }: LinkEditPopoverProps): ReactElement {
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
    function handleClickOutside(e: MouseEvent): void {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>): void => {
    e.preventDefault();
    if (href) {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    onClose();
  };

  const handleRemove = (): void => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  return (
    <div ref={popoverRef} className="rte-link-popover">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-medium text-deep-text/70">链接地址</label>
        <input
          type="url"
          className="rte-input rte-input--sm"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://..."
          autoFocus
        />
        <label className="text-xs font-medium text-deep-text/70">显示文本</label>
        <input
          type="text"
          className="rte-input rte-input--sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="链接文字"
        />
        <div className="flex justify-between mt-1">
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm text-error" onClick={handleRemove}>
            移除链接
          </button>
          <button type="submit" className="rte-btn rte-btn--primary rte-btn--sm">
            确认
          </button>
        </div>
      </form>
    </div>
  );
}
