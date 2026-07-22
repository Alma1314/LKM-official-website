import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { history } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/language';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SourceEditor({ value, onChange }: SourceEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorViewRef = useRef<EditorView | null>(null);
  const isInternalRef = useRef(false);

  // Create CodeMirror editor
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        markdown(),
        lineNumbers(),
        highlightActiveLine(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        history(),
        keymap.of([]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isInternalRef.current) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            minHeight: '60vh',
          },
          '.cm-scroller': {
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: '14px',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, []);

  // Sync external value changes into CodeMirror
  useEffect(() => {
    const view = editorViewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (value !== currentValue) {
      isInternalRef.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
      isInternalRef.current = false;
    }
  }, [value]);

  return <div ref={containerRef} className="border border-base-300 rounded-b-lg overflow-hidden bg-base-100" />;
}
