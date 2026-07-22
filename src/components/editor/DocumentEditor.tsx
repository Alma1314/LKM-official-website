import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { getEditorExtensions } from '~/editor/extensions';
import { importMdx, exportMdx } from '~/editor/mdx';
import { useAutoSave } from '~/lib/autosave';
import { createDocument, getDocument as loadFromStorage } from '~/lib/document-api';
import type { EditorMode } from '~/editor/types';
import EditorToolbar from './EditorToolbar';
import ModeTabs from './ModeTabs';
import SourceEditor from './SourceEditor';
import SaveStatusIndicator from './SaveStatusIndicator';

interface DocumentEditorProps {
  documentId: string;
}

interface CharacterCountStorage {
  characterCount: {
    characters: () => number;
    words: () => number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCharacterCount(editor: any): CharacterCountStorage | undefined {
  return editor?.storage as CharacterCountStorage | undefined;
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [docId, setDocId] = useState(documentId === 'new' ? '' : documentId);
  const { saveStatus, triggerSave, loadDraft } = useAutoSave(docId, 1000);
  const [mode, setMode] = useState<EditorMode>('richtext');

  // Refs for MDX state
  const sourceMdxRef = useRef('');
  const frontmatterRef = useRef<Record<string, unknown>>({});
  const lastValidEditorJsonRef = useRef<Record<string, unknown> | null>(null);

  // Resolve document: new → create, existing → load
  useEffect(() => {
    if (documentId === 'new') {
      const doc = createDocument();
      setDocId(doc.id);
      window.history.replaceState(null, '', `/admin/documents/editor?id=${doc.id}`);
    }
  }, [documentId]);

  const handleUpdate = useCallback(
    ({ editor }: { editor: { getJSON: () => Record<string, unknown> } }) => {
      if (!editor || !docId) return;
      const json = editor.getJSON();
      lastValidEditorJsonRef.current = json;
      triggerSave(json);
    },
    [triggerSave, docId]
  );

  const editor = useEditor({
    extensions: getEditorExtensions('开始编写内容……'),
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[60vh] px-8 py-6',
      },
    },
  });

  // Load existing content when editor and docId are ready
  useEffect(() => {
    if (!editor || !docId || documentId === 'new') return;
    const doc = loadFromStorage(docId) ?? loadDraft();
    if (!doc) return;

    // Prefer contentMdx (canonical source) over editorJson cache
    if (doc.contentMdx && doc.contentMdx.trim().length > 0) {
      try {
        const result = importMdx(doc.contentMdx);
        frontmatterRef.current = result.frontmatter;
        sourceMdxRef.current = doc.contentMdx;
        editor.commands.setContent({ type: 'doc', content: result.content });
        lastValidEditorJsonRef.current = editor.getJSON();
      } catch {
        // Fallback to editorJson if MDX parsing fails
        if (doc.editorJson) {
          editor.commands.setContent(doc.editorJson);
        }
      }
    } else if (doc.editorJson) {
      editor.commands.setContent(doc.editorJson);
    }
  }, [editor, docId, documentId, loadDraft]);

  // Mode switching
  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      if (newMode === mode) return;

      if (mode === 'richtext' && newMode === 'source') {
        // Export current editor to MDX before switching
        if (editor) {
          const json = editor.getJSON();
          const doc =
            typeof json === 'object' && json !== null && 'content' in json
              ? (json as { content: Parameters<typeof exportMdx>[0] }).content
              : (json as unknown as Parameters<typeof exportMdx>[0]);
          const result = exportMdx(doc, frontmatterRef.current);
          sourceMdxRef.current = result.mdx;
          lastValidEditorJsonRef.current = editor.getJSON();
        }
      }

      if (mode === 'source' && newMode === 'richtext') {
        // Parse source MDX before switching
        try {
          const result = importMdx(sourceMdxRef.current);
          if (editor) {
            editor.commands.clearContent();
            editor.commands.setContent({ type: 'doc', content: result.content });
            frontmatterRef.current = result.frontmatter;
            lastValidEditorJsonRef.current = editor.getJSON();
          }
        } catch {
          alert('MDX 解析失败，请检查源码格式后重试');
          return;
        }
      }

      setMode(newMode);
    },
    [mode, editor]
  );

  // Source editor change handler
  const handleSourceChange = useCallback(
    (mdx: string) => {
      sourceMdxRef.current = mdx;
      // Trigger autosave from source mode
      if (docId) {
        triggerSave(lastValidEditorJsonRef.current ?? {});
      }
    },
    [docId, triggerSave]
  );

  const cc = getCharacterCount(editor);
  const charCount = cc?.characterCount.characters() ?? 0;
  const wordCount = cc?.characterCount.words() ?? 0;

  return (
    <div className="flex flex-col border border-base-300 rounded-lg bg-base-100 shadow-sm">
      {/* Header bar: save status + mode tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50 rounded-t-lg">
        <SaveStatusIndicator
          status={saveStatus}
          charCount={mode === 'richtext' ? charCount : undefined}
          wordCount={mode === 'richtext' ? wordCount : undefined}
        />
        <ModeTabs mode={mode} onModeChange={handleModeChange} />
      </div>

      {mode === 'richtext' && editor ? (
        <>
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </>
      ) : mode === 'source' ? (
        <SourceEditor value={sourceMdxRef.current} onChange={handleSourceChange} />
      ) : mode === 'preview' ? (
        <div className="flex items-center justify-center min-h-[60vh] text-base-content/50">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3 opacity-50"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <p>预览模式将在后续版本中实现</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh] text-base-content/40">
          <span className="loading loading-spinner loading-md mr-2" />
          正在加载编辑器……
        </div>
      )}
    </div>
  );
}
