import { memo, useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Node } from '@tiptap/pm/model';
import { NodeViewWrapper } from '@tiptap/react';
import katex from 'katex';
import MathEditor from './MathEditor';
import { t } from '~/lib/i18n';

interface BlockMathNodeViewProps {
  node: Node;
  updateAttributes: (attrs: Record<string, unknown>) => void;
}

const BlockMathNodeView = memo(function BlockMathNodeView({
  node,
  updateAttributes,
}: BlockMathNodeViewProps): ReactElement {
  const [editing, setEditing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const latex = (node.attrs.latex as string) || '';

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    if (latex) {
      try {
        el.innerHTML = katex.renderToString(latex, { displayMode: true, throwOnError: false });
      } catch (err) {
        console.warn('[BlockMathNodeView] KaTeX 渲染失败:', err);
        el.innerHTML = `<span class="text-[var(--error)] text-sm">${t('editor.math.latexSyntaxError')}</span>`;
      }
    } else {
      el.innerHTML = `<span class="text-[var(--deep-text)]/30 text-sm italic">${t('editor.clickToEditFormula')}</span>`;
    }
  }, [latex]);

  return (
    <NodeViewWrapper contentEditable={false} data-block-math>
      <div ref={previewRef} className="my-4 text-center select-none cursor-pointer" onClick={() => setEditing(true)} />
      {editing && (
        <MathEditor
          initialLatex={latex}
          isBlock
          onConfirm={(newLatex) => {
            updateAttributes({ latex: newLatex });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      )}
    </NodeViewWrapper>
  );
});

export default BlockMathNodeView;
