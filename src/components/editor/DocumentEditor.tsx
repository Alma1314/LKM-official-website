import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { getEditorExtensions } from '~/editor/extensions';
import { useAutoSave } from '~/lib/autosave';
import { createDocument, getDocument as loadFromStorage } from '~/lib/document-api';
import EditorToolbar from './EditorToolbar';
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
      triggerSave(editor.getJSON());
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
    if (doc?.editorJson) {
      editor.commands.setContent(doc.editorJson);
    }
  }, [editor, docId, documentId, loadDraft]);

  const cc = getCharacterCount(editor);
  const charCount = cc?.characterCount.characters() ?? 0;
  const wordCount = cc?.characterCount.words() ?? 0;

  return (
    <div className="flex flex-col border border-base-300 rounded-lg bg-base-100 shadow-sm">
      {/* Header bar: title + save status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-200/50 rounded-t-lg">
        <SaveStatusIndicator status={saveStatus} charCount={charCount} wordCount={wordCount} />
      </div>

      {editor ? (
        <>
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[60vh] text-base-content/40">
          <span className="loading loading-spinner loading-md mr-2" />
          正在加载编辑器……
        </div>
      )}
    </div>
  );
}
