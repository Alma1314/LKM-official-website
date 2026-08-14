import { memo, useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import type { Node } from '@tiptap/pm/model';
import katex from 'katex';
import MathEditor from './MathEditor';

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
        el.innerHTML = '<span class="text-[var(--error)] text-sm">LaTeX 语法错误</span>';
      }
    } else {
      el.innerHTML = '<span class="text-[var(--deep-text)]/30 text-sm italic">点击编辑公式</span>';
    }
  }, [latex]);

  return (
    <div contentEditable={false} data-block-math>
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
    </div>
  );
});

export default BlockMathNodeView;
