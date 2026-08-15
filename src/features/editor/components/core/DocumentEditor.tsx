import { useCallback, useEffect, useRef, useState, useMemo, Suspense, lazy } from 'react';
import type { ReactElement } from 'react';
import FullscreenButton from '../toolbar/FullscreenButton';
import CommentPanel from '../panels/CommentPanel';
import { setupKeyboardAutoScroll } from '../../hooks/useMobileEditor';
import { useEditor, EditorContent } from '@tiptap/react';
import { getEditorExtensions } from '../../engine/extensions/index';
import { useEditorPersistence } from '../../hooks/useEditorPersistence';
import { exportMdx } from '../../engine/mdx/index';
import { serializeHtml } from '../../engine/serialize-html';
import type { PersistenceAdapter, EditorMode, VersionEntry, DocumentData } from '../../engine/types';
import EditorToolbar from '../toolbar/EditorToolbar';
import ModeTabs from './ModeTabs';
import SaveStatusIndicator from '../toolbar/SaveStatusIndicator';
import BubbleMenuWrapper from '../toolbar/BubbleMenu';
import SlashMenu from '../dialogs/SlashMenu';
import PreviewPanel from '../panels/PreviewPanel';
import PublishButton from '../dialogs/PublishButton';
import VersionHistoryPanel from '../panels/VersionHistoryPanel';
import ExportMenu from '../dialogs/ExportMenu';
import BackupMenu from '../panels/BackupMenu';

// 懒加载：CodeMirror（仅在切换到源码模式时加载）
const SourceEditor = lazy(() => import('./SourceEditor'));
// 懒加载：AI 助手（仅在点击 AI 按钮时加载）
const AiAssistant = lazy(() => import('../panels/AiAssistant'));
// 懒加载：面板和对话框（仅在需要时显示）
const PropertyPanel = lazy(() => import('../panels/PropertyPanel'));
const PublishDialog = lazy(() => import('../dialogs/PublishDialog'));

interface DocumentEditorProps {
  documentId: string;
  adapter: PersistenceAdapter;
}

import { computeTextMetrics } from '../../engine/text-metrics';
import { saveImageBlob } from '../../persistence/image-store';

/** 上传图片为 blob 引用，避免 base64 塞满 localStorage */
function uploadImageToBlob(file: File): Promise<string> {
  return saveImageBlob(file);
}

export default function DocumentEditor({ documentId, adapter }: DocumentEditorProps): ReactElement {
  const [docId, setDocId] = useState(documentId === 'new' ? '' : documentId);
  const {
    saveStatus,
    triggerSave,
    loadDraft,
    importMdxContent,
    exportMdxContent,
    sourceMdxRef,
    frontmatterRef,
    lastValidJsonRef: lastValidEditorJsonRef,
  } = useEditorPersistence(docId, adapter);
  const [mode, setMode] = useState<EditorMode>('richtext');

  // Slash 菜单状态
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [slashPos, setSlashPos] = useState<{ top: number; left: number } | null>(null);

  // 发布状态
  const [publishOpen, setPublishOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 版本历史状态
  const [versionPanelOpen, setVersionPanelOpen] = useState(false);

  // AI 助手状态
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // 评论面板状态
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);

  // 源码视图类型（MDX / HTML）
  const [sourceKind, setSourceKind] = useState<'mdx' | 'html'>('mdx');

  // 解析文档：新建 → 创建，已有 → 加载
  useEffect(() => {
    if (documentId === 'new') {
      (async () => {
        const doc: DocumentData = {
          id: crypto.randomUUID(),
          title: '无标题文档',
          contentMdx: '',
          editorJson: null,
          status: 'draft',
          version: 1,
          lastModified: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await adapter.saveDocument(doc);
        setDocId(doc.id);
        const base = (window as unknown as Record<string, string>).__BASE_URL__ || '';
        // base 为 '/' 时 `${base}/admin/...` 会拼成 '//admin/...'（协议相对 URL，被解析为 http://admin/...），
        // 导致 replaceState 抛 SecurityError。去尾部斜杠后再拼接。
        window.history.replaceState(null, '', `${base.replace(/\/+$/, '')}/admin/documents/editor?id=${doc.id}`);
      })();
    }
  }, [documentId, adapter]);

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
        class: 'rte-editor-content',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              uploadImageToBlob(file)
                .then((blobRef) => {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: blobRef }))
                  );
                })
                .catch(() => {
                  // 忽略上传错误
                });
              return true;
            }
          }
        }
        // TSV 粘贴
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
            uploadImageToBlob(file)
              .then((blobRef) => {
                const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const pos = coords?.pos ?? view.state.selection.from;
                view.dispatch(view.state.tr.insert(pos, view.state.schema.nodes.image.create({ src: blobRef })));
              })
              .catch(() => {
                // 忽略上传错误
              });
          }
        });
        return handled;
      },
    },
  });

  // 检测斜杠命令触发
  useEffect(() => {
    if (!editor) return;

    const handleTextInput = (): void => {
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

    const handleUpdate = (): void => {
      if (slashOpen) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { $from } = (editor.state as any).selection;
        const parentText = $from.parent.textBetween(Math.max(0, $from.parentOffset - 20), $from.parentOffset);
        if (!parentText.includes('/')) {
          setSlashOpen(false);
        }
      }
    };

    editor.on('selectionUpdate', handleTextInput);
    editor.on('update', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleTextInput);
      editor.off('update', handleUpdate);
    };
  }, [editor, slashOpen]);

  // 移动端键盘自动滚动
  useEffect(() => {
    if (editor) {
      const el = (editor.view.dom as HTMLElement).closest('.ProseMirror') as HTMLElement;
      return setupKeyboardAutoScroll(el);
    }
  }, [editor]);

  // 编辑器和 docId 就绪后加载已有内容
  useEffect(() => {
    if (!editor || !docId || documentId === 'new') return;
    (async () => {
      const loaded = await adapter.loadDocument(docId);
      const doc: DocumentData | null = loaded ?? (await loadDraft());
      if (!doc) return;

      if (doc.contentMdx && doc.contentMdx.trim().length > 0) {
        importMdxContent(doc.contentMdx)
          .then((result) => {
            editor.commands.setContent({ type: 'doc', content: result.content });
            lastValidEditorJsonRef.current = editor.getJSON();
          })
          .catch((err) => {
            console.warn('[DocumentEditor] MDX 加载回退到 editorJson:', err);
            if (doc.editorJson) {
              editor.commands.setContent(doc.editorJson);
            }
          });
      } else if (doc.editorJson) {
        editor.commands.setContent(doc.editorJson);
      }
    })();
  }, [editor, docId, documentId, loadDraft, importMdxContent, lastValidEditorJsonRef, adapter]);

  // 模式切换
  const handleModeChange = useCallback(
    async (newMode: EditorMode) => {
      if (newMode === mode) return;

      if (mode === 'richtext' && newMode === 'source') {
        if (editor) {
          const json = editor.getJSON();
          const doc =
            typeof json === 'object' && json !== null && 'content' in json
              ? (json as { content: unknown[] }).content
              : [];
          // 同步调用 exportMdx — 内部全是纯计算无网络请求，避免无意义 await
          const result = exportMdx(doc as unknown[] as Parameters<typeof exportMdx>[0], frontmatterRef.current);
          sourceMdxRef.current = result.mdx;
          lastValidEditorJsonRef.current = editor.getJSON();
        }
      }

      if (mode === 'source' && newMode === 'richtext') {
        try {
          const result = await importMdxContent(sourceMdxRef.current);
          if (editor) {
            editor.commands.clearContent();
            editor.commands.setContent({ type: 'doc', content: result.content });
            lastValidEditorJsonRef.current = editor.getJSON();
          }
        } catch (err) {
          console.warn('[DocumentEditor] MDX 手动解析失败:', err);
          alert('MDX 解析失败，请检查源码格式后重试');
          return;
        }
      }

      setMode(newMode);
    },
    [mode, editor, exportMdxContent, importMdxContent, sourceMdxRef, frontmatterRef, lastValidEditorJsonRef]
  );

  const handleSourceChange = useCallback(
    (mdx: string) => {
      sourceMdxRef.current = mdx;
      if (docId) {
        triggerSave(lastValidEditorJsonRef.current ?? {});
      }
    },
    [docId, triggerSave, sourceMdxRef, lastValidEditorJsonRef]
  );

  const handlePublish = useCallback(
    async (title: string, _slug: string) => {
      if (!docId) return;
      const doc = await adapter.loadDocument(docId);
      if (doc) {
        const updated: DocumentData = { ...doc, title, status: 'published', updatedAt: new Date().toISOString() };
        await adapter.saveDocument(updated);
        await adapter.saveVersion(docId, updated, '发布');
        setRefreshKey((k) => k + 1);
      }
      setPublishOpen(false);
    },
    [docId, adapter]
  );

  const handleComment = useCallback(
    (from: number, to: number, text: string) => {
      if (!editor || !docId || !adapter.addThread) return;
      const threadId = crypto.randomUUID();
      editor.chain().focus().setMark('commentMark', { threadId, resolved: 'false' }).run();
      adapter.addThread(docId, { from, to }, text);
      setCommentPanelOpen(true);
    },
    [editor, docId, adapter]
  );

  const handleCommentHighlightClick = useCallback((_range: { from: number; to: number }) => {
    // 滚动编辑器到评论位置
    // 目前仅切换面板
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

  // rAF 延迟计算 metrics，避免同步递归遍历阻塞输入
  const [metrics, setMetrics] = useState({ characters: 0, words: 0 });
  const metricsRafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!editor) return;
    if (metricsRafRef.current) cancelAnimationFrame(metricsRafRef.current);
    metricsRafRef.current = requestAnimationFrame(() => {
      setMetrics(computeTextMetrics(editor.getJSON() as Record<string, unknown>));
    });
    return () => {
      if (metricsRafRef.current) cancelAnimationFrame(metricsRafRef.current);
    };
  }, [editor?.state.doc]);

  const charCount = metrics.characters;
  const wordCount = metrics.words;

  // HTML 源码（只读查看）：随编辑器内容变化重新生成
  const htmlSource = useMemo(() => {
    if (!editor) return '';
    const content = (editor.getJSON().content ?? []) as Parameters<typeof serializeHtml>[0];
    return serializeHtml(content);
  }, [editor?.state.doc]);

  return (
    <div className="rte-container">
      {/* Tier 1: sticky 顶栏容器（两行一起固定） */}
      <div className="rte-topbar">
        {/* 上行：状态 + 操作按钮 */}
        <div className="rte-statusbar">
          <SaveStatusIndicator
            status={saveStatus}
            charCount={mode === 'richtext' ? charCount : undefined}
            wordCount={mode === 'richtext' ? wordCount : undefined}
          />
          <div className="flex items-center gap-1 md:gap-2">
            {editor && <ExportMenu editor={editor} />}
            {docId && <BackupMenu adapter={adapter} />}
            {editor && (
              <button
                type="button"
                className={aiPanelOpen ? 'rte-toolbar-btn is-active' : 'rte-btn rte-btn--ghost rte-btn--xs'}
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
                title="AI 助手"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z" />
                </svg>
              </button>
            )}
            {docId && mode === 'richtext' && (
              <>
                <button
                  type="button"
                  className={commentPanelOpen ? 'rte-toolbar-btn is-active' : 'rte-btn rte-btn--ghost rte-btn--xs'}
                  onClick={() => {
                    setCommentPanelOpen(!commentPanelOpen);
                    setVersionPanelOpen(false);
                  }}
                  title="评论"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="rte-btn rte-btn--ghost rte-btn--xs"
                  onClick={() => {
                    setVersionPanelOpen(!versionPanelOpen);
                    setCommentPanelOpen(false);
                  }}
                  title="版本"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                </button>
              </>
            )}
            {docId && (
              <div key={refreshKey}>
                <PublishButton
                  documentId={docId}
                  adapter={adapter}
                  onStatusChange={() => setRefreshKey((k) => k + 1)}
                  onOpenPublishDialog={() => setPublishOpen(true)}
                />
              </div>
            )}
            <FullscreenButton />
            <ModeTabs mode={mode} onModeChange={handleModeChange} />
          </div>
        </div>

        {/* 下行：格式化工具栏（仅 richtext 模式显示） */}
        {mode === 'richtext' && editor && <EditorToolbar editor={editor} />}
      </div>

      {/* 编辑器内容区域 */}
      {mode === 'richtext' && editor ? (
        <div className="rte-editor-area">
          <div className="rte-editor-main">
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
              adapter={adapter}
              onClose={() => setCommentPanelOpen(false)}
              onHighlightClick={handleCommentHighlightClick}
            />
          ) : versionPanelOpen ? (
            <VersionHistoryPanel
              documentId={docId}
              adapter={adapter}
              onRestore={handleRestoreVersion}
              onClose={() => setVersionPanelOpen(false)}
            />
          ) : (
            <Suspense fallback={null}>
              <PropertyPanel editor={editor} />
            </Suspense>
          )}
        </div>
      ) : mode === 'source' ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-1 p-2 border-b border-surface-3 shrink-0">
            <button
              type="button"
              className={`rte-mode-tab ${sourceKind === 'mdx' ? 'is-active' : ''}`}
              onClick={() => setSourceKind('mdx')}
            >
              MDX
            </button>
            <button
              type="button"
              className={`rte-mode-tab ${sourceKind === 'html' ? 'is-active' : ''}`}
              onClick={() => setSourceKind('html')}
            >
              HTML
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <Suspense
              fallback={
                <div className="rte-loading">
                  <div className="rte-spinner" />
                </div>
              }
            >
              {sourceKind === 'mdx' ? (
                <SourceEditor value={sourceMdxRef.current} onChange={handleSourceChange} />
              ) : (
                <SourceEditor value={htmlSource} onChange={() => {}} readOnly />
              )}
            </Suspense>
          </div>
        </div>
      ) : mode === 'preview' && editor ? (
        <PreviewPanel editor={editor} />
      ) : (
        <div className="rte-loading">
          <div className="rte-spinner" />
          <span>正在加载编辑器……</span>
        </div>
      )}

      {publishOpen && (
        <Suspense fallback={null}>
          <PublishDialog currentTitle={''} onConfirm={handlePublish} onCancel={() => setPublishOpen(false)} />
        </Suspense>
      )}

      {aiPanelOpen && (
        <Suspense fallback={null}>
          <AiAssistant editor={editor!} onClose={() => setAiPanelOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
