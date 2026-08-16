import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Editor } from '@tiptap/core';
import { t } from '~/lib/i18n';

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
    const trimmedHref = href.trim();
    const finalText = text.trim();
    if (!trimmedHref) return; // 无地址不提交，保留弹窗

    const chain = editor.chain().focus();
    const { from, to } = editor.state.selection;
    const currentText = editor.state.doc.textBetween(from, to, ' ');

    if (finalText && finalText !== currentText) {
      // 显示文本有改动（或光标无选区）：用新文本 + 链接替换/插入
      chain.extendMarkRange('link');
      if (from !== to || editor.isActive('link')) {
        chain.deleteSelection();
      }
      chain.insertContent({
        type: 'text',
        text: finalText,
        marks: [{ type: 'link', attrs: { href: trimmedHref } }],
      });
    } else {
      chain.extendMarkRange('link').setLink({ href: trimmedHref });
    }
    chain.run();
    onClose();
  };

  const handleRemove = (): void => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  return (
    <div ref={popoverRef} className="rte-link-popover">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="text-xs font-medium text-deep-text/70">{t('editor.linkUrl')}</label>
        <input
          type="url"
          className="rte-input rte-input--sm"
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://..."
          autoFocus
        />
        <label className="text-xs font-medium text-deep-text/70">{t('editor.linkText')}</label>
        <input
          type="text"
          className="rte-input rte-input--sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('editor.linkTextPlaceholder')}
        />
        <div className="flex justify-between mt-1">
          <button type="button" className="rte-btn rte-btn--ghost rte-btn--sm text-error" onClick={handleRemove}>
            {t('editor.removeLink')}
          </button>
          <button type="submit" className="rte-btn rte-btn--primary rte-btn--sm">
            {t('editor.confirm')}
          </button>
        </div>
      </form>
    </div>
  );
}
