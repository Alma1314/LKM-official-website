import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { history } from "@codemirror/commands";
import {
  bracketMatching,
  syntaxHighlighting,
  HighlightStyle,
} from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";

const markdownHighlightStyle = HighlightStyle.define([
  {
    tag: [
      tags.heading1,
      tags.heading2,
      tags.heading3,
      tags.heading4,
      tags.heading5,
      tags.heading6,
    ],
    color: "var(--primary)",
    fontWeight: "600",
  },
  { tag: tags.strong, fontWeight: "700" },
  { tag: tags.emphasis, fontStyle: "italic" },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through",
    color: "var(--text-muted)",
  },
  {
    tag: [tags.link, tags.url],
    color: "var(--info)",
    textDecoration: "underline",
  },
  { tag: tags.monospace, color: "var(--inline-code-color)" },
  { tag: tags.quote, color: "var(--text-muted)", fontStyle: "italic" },
  { tag: tags.contentSeparator, color: "var(--text-muted)" },
  {
    tag: [tags.processingInstruction, tags.meta, tags.comment],
    color: "var(--text-muted)",
    fontStyle: "italic",
  },
]);

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SourceEditor({
  value,
  onChange,
}: SourceEditorProps): ReactElement {
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
        syntaxHighlighting(markdownHighlightStyle),
        keymap.of([]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !isInternalRef.current) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        // 使用站点 CSS 变量使 CodeMirror 自动适配深色/浅色主题（:root.dark）
        EditorView.theme({
          "&": {
            height: "100%",
            minHeight: "60vh",
            backgroundColor: "var(--card-bg)",
            color: "var(--deep-text)",
          },
          ".cm-scroller": {
            fontFamily:
              "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
            fontSize: "14px",
          },
          ".cm-content": {
            caretColor: "var(--deep-text)",
          },
          ".cm-gutters": {
            backgroundColor: "var(--base-200)",
            color: "var(--text-muted)",
            border: "none",
          },
          ".cm-activeLine": {
            backgroundColor:
              "color-mix(in oklab, var(--primary) 6%, transparent)",
          },
          ".cm-activeLineGutter": {
            backgroundColor:
              "color-mix(in oklab, var(--primary) 10%, transparent)",
            color: "var(--deep-text)",
          },
          ".cm-cursor": {
            borderLeftColor: "var(--deep-text)",
          },
          "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
            {
              backgroundColor: "var(--selection-bg)",
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

  return <div ref={containerRef} className="rte-container" />;
}
