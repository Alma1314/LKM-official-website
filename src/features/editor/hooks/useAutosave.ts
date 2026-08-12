import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus, PersistenceAdapter, DocumentData } from '../engine/types';
import { exportMdx } from '../engine/mdx/index';

const FALLBACK_PREFIX = 'autosave_fallback_';

function writeFallback(docId: string, data: unknown): void {
  try {
    localStorage.setItem(FALLBACK_PREFIX + docId, JSON.stringify(data));
  } catch {
    // localStorage 也失败了，静默处理
  }
}

function readFallback(docId: string): unknown | null {
  try {
    const key = FALLBACK_PREFIX + docId;
    const raw = localStorage.getItem(key);
    if (raw) {
      localStorage.removeItem(key);
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function useAutoSave(
  documentId: string,
  adapter: PersistenceAdapter,
  debounceMs = 1000,
  getFrontmatter?: () => Record<string, unknown>
): {
  saveStatus: SaveStatus;
  triggerSave: (content: Record<string, unknown>) => void;
  loadDraft: () => Promise<DocumentData | null>;
  flushImmediate: (content: Record<string, unknown>) => void;
} {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const hasUnsavedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseVersionRef = useRef(1);
  const savedCallbackRef = useRef<(() => void) | null>(null);
  const lastSavedJsonHashRef = useRef<string>('');
  const lastVersionSaveRef = useRef<number>(0);

  const loadDraft = useCallback(async () => {
    const doc = await Promise.resolve(adapter.loadDocument(documentId));
    if (doc) {
      baseVersionRef.current = doc.version;
      const fallback = readFallback(documentId);
      if (fallback && typeof fallback === 'object') {
        console.info('[autosave] 从兜底备份恢复文档:', documentId);
        if (doc.editorJson) {
          return { ...doc, editorJson: fallback as Record<string, unknown> };
        }
        return doc;
      }
      return doc;
    }
    return null;
  }, [documentId, adapter]);

  const doSave = useCallback(
    async (content: Record<string, unknown>) => {
      setSaveStatus('saving');
      try {
        const jsonStr = JSON.stringify(content);
        if (jsonStr === lastSavedJsonHashRef.current) {
          setSaveStatus('saved');
          hasUnsavedRef.current = false;
          return;
        }

        let mdxContent = '';
        try {
          const json = content as { content?: Array<Record<string, unknown>> };
          const nodes = json.content ?? [];
          // 使用文档的 frontmatter（导入时记录），避免自动保存丢失文档元信息
          const frontmatter = getFrontmatter?.() ?? {};
          const result = exportMdx(nodes, frontmatter);
          mdxContent = result.mdx;
        } catch (err) {
          console.warn('[autosave] MDX 导出失败:', err);
          mdxContent = '';
        }

        const existing = (await adapter.loadDocument(documentId)) as DocumentData | null;

        if (existing && existing.version !== baseVersionRef.current) {
          setSaveStatus('conflict');
          return;
        }

        const now = new Date().toISOString();
        const newVersion = (existing?.version ?? 0) + 1;

        const doc: DocumentData = {
          id: documentId,
          title: existing?.title ?? '无标题文档',
          contentMdx: mdxContent,
          editorJson: content,
          status: existing?.status ?? 'draft',
          version: newVersion,
          lastModified: now,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };

        await adapter.saveDocument(doc);

        baseVersionRef.current = newVersion;
        lastSavedJsonHashRef.current = jsonStr;
        setSaveStatus('saved');
        hasUnsavedRef.current = false;
        savedCallbackRef.current?.();

        // 异步备份
        try {
          await adapter.createBackup(documentId, {
            docId: documentId,
            title: doc.title,
            contentMdx: mdxContent,
            editorJson: content,
            status: doc.status,
            version: newVersion,
          });
        } catch {
          writeFallback(documentId, { content, mdxContent, version: newVersion });
        }

        // 版本快照节流：同一文档同一分钟内最多一次
        const nowTs = Date.now();
        if (nowTs - lastVersionSaveRef.current > 60_000) {
          lastVersionSaveRef.current = nowTs;
          try {
            if (mdxContent) {
              await adapter.saveVersion(documentId, doc, '');
            }
          } catch (err) {
            console.warn('[autosave] 版本存储异常:', err);
          }
        }
      } catch (err) {
        console.warn('[autosave] 保存失败:', err);
        writeFallback(documentId, { content });
        setSaveStatus('error');
      }
    },
    [documentId, adapter, getFrontmatter]
  );

  const triggerSave = useCallback(
    (content: Record<string, unknown>) => {
      hasUnsavedRef.current = true;
      setSaveStatus('unsaved');

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        doSave(content);
      }, debounceMs);
    },
    [debounceMs, doSave]
  );

  const flushImmediate = useCallback(
    (content: Record<string, unknown>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (hasUnsavedRef.current) {
        doSave(content);
      }
    },
    [doSave]
  );

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsavedRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    triggerSave,
    loadDraft,
    flushImmediate,
  };
}
