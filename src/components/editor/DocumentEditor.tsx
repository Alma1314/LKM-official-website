import { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react';
import FullscreenButton from './FullscreenButton';
import CommentPanel from './CommentPanel';
import { addThread } from '~/lib/comment-store';
import { setupKeyboardAutoScroll } from '~/lib/mobile-editor';
import { useEditor, EditorContent } from '@tiptap/react';
import { getEditorExtensions } from '~/editor/extensions';
import { useAutoSave } from '~/lib/autosave';
import { createDocument, getDocument as loadFromStorage } from '~/lib/document-api';
import type { EditorMode } from '~/editor/types';
import EditorToolbar from './EditorToolbar';
import ModeTabs from './ModeTabs';
import SaveStatusIndicator from './SaveStatusIndicator';
import BubbleMenuWrapper from './BubbleMenu';
import SlashMenu from './SlashMenu';
import PreviewPanel from './PreviewPanel';
import PropertyPanel from './PropertyPanel';
import PublishDialog from './PublishDialog';
import PublishButton from './PublishButton';
import VersionHistoryPanel from './VersionHistoryPanel';
import { saveVersion } from '~/lib/version-store';
import { updateDocument, getDocument as getDoc } from '~/lib/document-api';
import type { VersionEntry } from '~/lib/version-store';

// Lazy-loaded: CodeMirror (only when switching to source mode)
const SourceEditor = lazy(() => import('./SourceEditor'));
// Lazy-loaded: AI assistant (only when clicking AI button)
const AiAssistant = lazy(() => import('./AiAssistant'));
// Lazy-loaded: Export buttons (only shown when editor is ready)
const ExportPdfButton = lazy(() => import('./ExportPdfButton'));
const ExportDocxButton = lazy(() => import('./ExportDocxButton'));

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

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const [docId, setDocId] = useState(documentId === 'new' ? '' : documentId);
  const { saveStatus, triggerSave, loadDraft } = useAutoSave(docId, 1000);
  const [mode, setMode] = useState<EditorMode>('richtext');

  // Slash menu state
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);

  // Publish state
  const [publishOpen, setPublishOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Version history state
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);

  // AI assistant state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Comment panel state
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);

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

  const editor = useEditor({
    extensions: getEditorExtensions('开始编写内容……'),
    onUpdate({ editor: ed }) {
      if (!ed || !docId) return;
      const json = ed.getJSON();
      lastValidEditorJsonRef.current = json;
      triggerSave(json);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[60vh] px-8 py-6',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              readFileAsDataURL(file).then((dataUrl) => {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: dataUrl }))
                );
              });
              return true;
            }
          }
        }
        // TSV paste
        const text = event.clipboardData?.getData('text/plain');
        if (text && text.includes('\t')) {
          const rows = text
            .trim()
            .split('\n')
            .map((r) => r.split('\t'));
          if (rows.length > 1 && rows[0].length > 1) {
            const { insertTable } = view.state.schema.nodes;
            if (insertTable) {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  insertTable.create(
                    null,
                    Array.from({ length: rows.length }, (_, r) =>
                      view.state.schema.nodes.tableRow.create(
                        null,
                        rows[r].map((cell) =>
                          view.state.schema.nodes.tableCell.create(null, view.state.schema.text(cell))
                        )
                      )
                    )
                  )
                )
              );
              return true;
            }
          }
        }
        return false;
      },
      handleDrop(view, event, _moved, _slice) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        let handled = false;
        Array.from(files).forEach((file) => {
          if (file.type.startsWith('image/')) {
            handled = true;
            readFileAsDataURL(file).then((dataUrl) => {
              const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
              const pos = coords?.pos ?? view.state.selection.from;
              view.dispatch(view.state.tr.insert(pos, view.state.schema.nodes.image.create({ src: dataUrl })));
            });
          }
        });
        return handled;
      },
    },
  });

  // Detect slash command trigger
  useEffect(() => {
    if (!editor) return;

    const handleTextInput = () => {
      const { $from } = editor.state.selection;
      const parentText = $from.parent.textBetween(Math.max(0, $from.parentOffset - 20), $from.parentOffset);
      const slashMatch = parentText.match(/\/(\w*)$/);
      if (slashMatch) {
        setSlashQuery(slashMatch[1]);
        const coords = editor.view.coordsAtPos($from.pos);
        setSlashPos({ top: coords.bottom + 4, left: coords.left });
        setSlashOpen(true);
      } else if (slashOpen) {
        setSlashOpen(false);
      }
    };

    editor.on('selectionUpdate', handleTextInput);
    editor.on('update', () => {
      if (slashOpen) {
        const { $from } = editor.state.selection;
        const parentText = $from.parent.textBetween(Math.max(0, $from.parentOffset - 20), $from.parentOffset);
        if (!parentText.includes('/')) {
          setSlashOpen(false);
        }
      }
    });

    return () => {
      editor.off('selectionUpdate', handleTextInput);
    };
  }, [editor, slashOpen]);

  // Mobile keyboard auto-scroll
  useEffect(() => {
    if (editor) {
      const el = (editor.view.dom as HTMLElement).closest('.ProseMirror') as HTMLElement;
      return setupKeyboardAutoScroll(el);
    }
  }, [editor]);

  // Load existing content when editor and docId are ready
  useEffect(() => {
    if (!editor || !docId || documentId === 'new') return;
    const doc = loadFromStorage(docId) ?? loadDraft();
    if (!doc) return;

    if (doc.contentMdx && doc.contentMdx.trim().length > 0) {
      // Dynamic import for MDX parsing — only when needed
      import('~/editor/mdx')
        .then(({ importMdx }) => {
          try {
            const result = importMdx(doc.contentMdx);
            frontmatterRef.current = result.frontmatter;
            sourceMdxRef.current = doc.contentMdx;
            editor.commands.setContent({ type: 'doc', content: result.content });
            lastValidEditorJsonRef.current = editor.getJSON();
          } catch {
            if (doc.editorJson) {
              editor.commands.setContent(doc.editorJson);
            }
          }
        })
        .catch(() => {
          if (doc.editorJson) {
            editor.commands.setContent(doc.editorJson);
          }
        });
    } else if (doc.editorJson) {
      editor.commands.setContent(doc.editorJson);
    }
  }, [editor, docId, documentId, loadDraft]);

  // Mode switching
  const handleModeChange = useCallback(
    async (newMode: EditorMode) => {
      if (newMode === mode) return;

      if (mode === 'richtext' && newMode === 'source') {
        if (editor) {
          const json = editor.getJSON();
          const doc =
            typeof json === 'object' && json !== null && 'content' in json
              ? (json as { content: unknown[] }).content
              : (json as unknown[]);
          const { exportMdx } = await import('~/editor/mdx');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = exportMdx(doc as any, frontmatterRef.current);
          sourceMdxRef.current = result.mdx;
          lastValidEditorJsonRef.current = editor.getJSON();
        }
      }

      if (mode === 'source' && newMode === 'richtext') {
        try {
          const { importMdx } = await import('~/editor/mdx');
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

  const handleSourceChange = useCallback(
    (mdx: string) => {
      sourceMdxRef.current = mdx;
      if (docId) {
        triggerSave(lastValidEditorJsonRef.current ?? {});
      }
    },
    [docId, triggerSave]
  );

  const handlePublish = useCallback(
    (title: string, _slug: string) => {
      if (!docId) return;
      const doc = getDoc(docId);
      if (doc) {
        const updated = updateDocument(docId, { ...doc, title, status: 'published' });
        if (updated) {
          saveVersion(docId, updated, '发布');
          setRefreshKey((k) => k + 1);
        }
      }
      setPublishOpen(false);
    },
    [docId]
  );

  const handleComment = useCallback(
    (from: number, to: number, text: string) => {
      if (!editor || !docId) return;
      // Add commentMark to the selected range
      const threadId = crypto.randomUUID();
      editor.chain().focus().setMark('commentMark', { threadId, resolved: 'false' }).run();
      addThread(docId, { from, to }, text);
      setCommentPanelOpen(true);
    },
    [editor, docId]
  );

  const handleCommentHighlightClick = useCallback((_range: { from: number; to: number }) => {
    // Scroll editor to the comment position
    // For now, just toggle the panel
  }, []);

  const handleRestoreVersion = useCallback(
    (version: VersionEntry) => {
      if (!editor) return;
      if (version.editorJson && typeof version.editorJson === 'object') {
        editor.commands.clearContent();
        editor.commands.setContent(version.editorJson);
        if (docId) {
          triggerSave(version.editorJson);
        }
        setRefreshKey((k) => k + 1);
        setVersionPanelOpen(false);
      }
    },
    [editor, docId, triggerSave]
  );

  const cc = getCharacterCount(editor);
  const charCount = cc?.characterCount.characters() ?? 0;
  const wordCount = cc?.characterCount.words() ?? 0;

  return (
    <div className="flex flex-col border border-base-300 rounded-lg bg-base-100 shadow-sm">
      <div className="flex items-center justify-between px-2 md:px-4 py-2 border-b border-base-300 bg-base-200/50 rounded-t-lg">
        <SaveStatusIndicator
          status={saveStatus}
          charCount={mode === 'richtext' ? charCount : undefined}
          wordCount={mode === 'richtext' ? wordCount : undefined}
        />
        <div className="flex items-center gap-1 md:gap-2">
          <FullscreenButton />
          {mode === 'richtext' && editor && (
            <>
              <Suspense fallback={null}>
                <ExportPdfButton editor={editor} />
              </Suspense>
              <Suspense fallback={null}>
                <ExportDocxButton editor={editor} />
              </Suspense>
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => setAiPanelOpen(!aiPanelOpen)}>
                AI
              </button>
            </>
          )}
          {docId && mode === 'richtext' && (
            <>
              <button
                type="button"
                className={`btn btn-ghost btn-xs ${commentPanelOpen ? 'btn-active' : ''}`}
                onClick={() => {
                  setCommentPanelOpen(!commentPanelOpen);
                  setVersionPanelOpen(false);
                }}
              >
                评论
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  setVersionPanelOpen(!versionPanelOpen);
                  setCommentPanelOpen(false);
                }}
              >
                版本
              </button>
            </>
          )}
          {docId && (
            <div key={refreshKey}>
              <PublishButton
                documentId={docId}
                onStatusChange={() => setRefreshKey((k) => k + 1)}
                onOpenPublishDialog={() => setPublishOpen(true)}
              />
            </div>
          )}
          <ModeTabs mode={mode} onModeChange={handleModeChange} />
        </div>
      </div>

      {mode === 'richtext' && editor ? (
        <div className="flex">
          <div className="flex-1 min-w-0">
            <EditorToolbar editor={editor} />
            <BubbleMenuWrapper editor={editor} onComment={handleComment} />
            {slashOpen && (
              <SlashMenu
                editor={editor}
                query={slashQuery}
                position={slashPos}
                onClose={() => setSlashOpen(false)}
                onSelect={() => setSlashOpen(false)}
              />
            )}
            <EditorContent editor={editor} />
          </div>
          {commentPanelOpen ? (
            <CommentPanel
              documentId={docId}
              onClose={() => setCommentPanelOpen(false)}
              onHighlightClick={handleCommentHighlightClick}
            />
          ) : versionPanelOpen ? (
            <VersionHistoryPanel
              documentId={docId}
              onRestore={handleRestoreVersion}
              onClose={() => setVersionPanelOpen(false)}
            />
          ) : (
            <PropertyPanel editor={editor} />
          )}
        </div>
      ) : mode === 'source' ? (
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <span className="loading loading-spinner" />
            </div>
          }
        >
          <SourceEditor value={sourceMdxRef.current} onChange={handleSourceChange} />
        </Suspense>
      ) : mode === 'preview' && editor ? (
        <PreviewPanel editor={editor} />
      ) : (
        <div className="flex items-center justify-center min-h-[60vh] text-base-content/40">
          <span className="loading loading-spinner loading-md mr-2" />
          正在加载编辑器……
        </div>
      )}

      {publishOpen && (
        <PublishDialog
          currentTitle={getDoc(docId)?.title ?? ''}
          onConfirm={handlePublish}
          onCancel={() => setPublishOpen(false)}
        />
      )}

      {aiPanelOpen && (
        <Suspense fallback={null}>
          <AiAssistant editor={editor!} onClose={() => setAiPanelOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
