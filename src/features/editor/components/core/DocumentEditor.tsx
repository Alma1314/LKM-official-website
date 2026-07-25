import { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react';
import FullscreenButton from '../toolbar/FullscreenButton';
import CommentPanel from '../panels/CommentPanel';
import { addThread } from '../../stores/comment-store';
import { setupKeyboardAutoScroll } from '../../hooks/mobileEditor';
import { useEditor, EditorContent } from '@tiptap/react';
import { getEditorExtensions } from '../../engine/extensions/index';
import { useEditorPersistence } from '../../hooks/useEditorPersistence';
import { exportMdx } from '../../engine/mdx/index';
import { createDocument, getDocument as loadFromStorage } from '../../stores/document-api';
import type { EditorMode } from '../../engine/types';
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
import { saveVersion } from '../../stores/version-store';
import { updateDocument, getDocument as getDoc } from '../../stores/document-api';
import type { VersionEntry } from '../../stores/version-store';

// 懒加载：CodeMirror（仅在切换到源码模式时加载）
const SourceEditor = lazy(() => import('./SourceEditor'));
// 懒加载：AI 助手（仅在点击 AI 按钮时加载）
const AiAssistant = lazy(() => import('../panels/AiAssistant'));
// 懒加载：面板和对话框（仅在需要时显示）
const PropertyPanel = lazy(() => import('../panels/PropertyPanel'));
const PublishDialog = lazy(() => import('../dialogs/PublishDialog'));

interface DocumentEditorProps {
  documentId: string;
}

import { computeTextMetrics } from '../../stores/text-metrics';

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
  const {
    saveStatus,
    triggerSave,
    loadDraft,
    importMdxContent,
    exportMdxContent,
    sourceMdxRef,
    frontmatterRef,
    lastValidJsonRef: lastValidEditorJsonRef,
  } = useEditorPersistence(docId);
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

  // 解析文档：新建 → 创建，已有 → 加载
  useEffect(() => {
    if (documentId === 'new') {
      const result = createDocument();
      if (!result.ok) {
        console.error('[DocumentEditor] 创建文档失败:', result.error.message);
        return;
      }
      setDocId(result.value.id);
      const base = (window as unknown as Record<string, string>).__BASE_URL__ || '';
      window.history.replaceState(null, '', `${base}/admin/documents/editor?id=${result.value.id}`);
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
              readFileAsDataURL(file)
                .then((dataUrl) => {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: dataUrl }))
                  );
                })
                .catch(() => {
                  // 忽略文件读取错误（图片损坏等）
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
            readFileAsDataURL(file)
              .then((dataUrl) => {
                const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const pos = coords?.pos ?? view.state.selection.from;
                view.dispatch(view.state.tr.insert(pos, view.state.schema.nodes.image.create({ src: dataUrl })));
              })
              .catch(() => {
                // 忽略文件读取错误
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

    const handleUpdate = () => {
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
    const doc = loadFromStorage(docId) ?? loadDraft();
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
  }, [editor, docId, documentId, loadDraft, importMdxContent, lastValidEditorJsonRef]);

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
    (title: string, _slug: string) => {
      if (!docId) return;
      const doc = getDoc(docId);
      if (doc) {
        const result = updateDocument(docId, { ...doc, title, status: 'published' });
        if (result.ok && result.value) {
          saveVersion(docId, result.value, '发布');
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
      // 将 commentMark 添加到选中范围
      const threadId = crypto.randomUUID();
      editor.chain().focus().setMark('commentMark', { threadId, resolved: 'false' }).run();
      addThread(docId, { from, to }, text);
      setCommentPanelOpen(true);
    },
    [editor, docId]
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

  return (
    <div className="flex flex-col border border-surface-3 rounded-lg bg-card-bg shadow-sm">
      {/* Tier 1: sticky 顶栏容器（两行一起固定） */}
      <div className="sticky top-0 z-30 rounded-t-lg overflow-hidden">
        {/* 上行：状态 + 操作按钮 */}
        <div className="flex items-center justify-between px-2 md:px-4 py-1.5 border-b border-surface-3 bg-page-bg/50">
          <SaveStatusIndicator
            status={saveStatus}
            charCount={mode === 'richtext' ? charCount : undefined}
            wordCount={mode === 'richtext' ? wordCount : undefined}
          />
          <div className="flex items-center gap-1 md:gap-2">
            {editor && <ExportMenu editor={editor} />}
            {docId && <BackupMenu />}
            {editor && (
              <button
                type="button"
                className={`btn btn-ghost btn-xs ${aiPanelOpen ? 'btn-active' : ''}`}
                onClick={() => setAiPanelOpen(!aiPanelOpen)}
              >
                AI
              </button>
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
            <FullscreenButton />
            <ModeTabs mode={mode} onModeChange={handleModeChange} />
          </div>
        </div>

        {/* 下行：格式化工具栏（仅 richtext 模式显示） */}
        {mode === 'richtext' && editor && <EditorToolbar editor={editor} />}
      </div>

      {/* 编辑器内容区域 */}
      {mode === 'richtext' && editor ? (
        <div className="flex">
          <div className="flex-1 min-w-0">
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
            <Suspense fallback={null}>
              <PropertyPanel editor={editor} />
            </Suspense>
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
        <div className="flex items-center justify-center min-h-[60vh] border border-surface-3 rounded-lg bg-card-bg">
          <span className="loading loading-spinner loading-md mr-2" />
          <span className="text-deep-text/50">正在加载编辑器……</span>
        </div>
      )}

      {publishOpen && (
        <Suspense fallback={null}>
          <PublishDialog
            currentTitle={getDoc(docId)?.title ?? ''}
            onConfirm={handlePublish}
            onCancel={() => setPublishOpen(false)}
          />
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
