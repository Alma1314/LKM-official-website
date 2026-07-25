import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '../engine/types';
import { autosave as apiAutosave, getDocument } from '../stores/document-api';
import { exportMdx } from '../engine/mdx/index';
import { saveBackup } from '../stores/backup-store';
import { saveVersion } from '../stores/version-store';

const FALLBACK_PREFIX = 'autosave_fallback_';

/** IndexedDB 写入失败时，将内容写入 localStorage 兜底。 */
function writeFallback(docId: string, data: unknown): void {
  try {
    localStorage.setItem(FALLBACK_PREFIX + docId, JSON.stringify(data));
  } catch {
    // localStorage 也失败了，静默处理
  }
}

/** 从 localStorage 兜底机制恢复数据，成功恢复后清除标记。 */
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

export function useAutoSave(documentId: string, debounceMs = 1000) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const hasUnsavedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseVersionRef = useRef(1);
  const savedCallbackRef = useRef<(() => void) | null>(null);
  const lastSavedJsonHashRef = useRef<string>('');
  const lastVersionSaveRef = useRef<number>(0);

  const loadDraft = useCallback(() => {
    const doc = getDocument(documentId);
    if (doc) {
      baseVersionRef.current = doc.version;
      // 检查是否有兜底备份需要恢复
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
  }, [documentId]);

  const doSave = useCallback(
    async (content: Record<string, unknown>) => {
      setSaveStatus('saving');
      try {
        // 内容去重：与上次保存的 JSON 一致则跳过 MDX 序列化
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
          const result = exportMdx(nodes, {});
          mdxContent = result.mdx;
        } catch (err) {
          console.warn('[autosave] MDX 导出失败:', err);
          mdxContent = '';
        }

        const result = apiAutosave(documentId, {
          contentMdx: mdxContent,
          editorJson: content,
          baseVersion: baseVersionRef.current,
        });

        if (result.ok) {
          baseVersionRef.current = result.version;
          lastSavedJsonHashRef.current = jsonStr;
          setSaveStatus('saved');
          hasUnsavedRef.current = false;
          savedCallbackRef.current?.();

          // 写入 IndexedDB 备份（异步，不阻塞保存流程）
          const doc = getDocument(documentId);
          if (doc) {
            saveBackup(documentId, {
              docId: documentId,
              title: doc.title,
              contentMdx: mdxContent,
              editorJson: content,
              status: doc.status,
              version: result.version,
              timestamp: doc.lastModified,
            }).catch(() => {
              // IndexedDB 备份失败 → localStorage 兜底
              writeFallback(documentId, { content, mdxContent, version: result.version });
            });
          }

          // 版本快照节流：同一文档同一分钟内最多一次
          const now = Date.now();
          if (now - lastVersionSaveRef.current > 60_000) {
            lastVersionSaveRef.current = now;
            try {
              const doc = getDocument(documentId);
              if (doc && mdxContent) {
                const versionResult = saveVersion(
                  documentId,
                  { ...doc, contentMdx: mdxContent, editorJson: content, version: result.version },
                  ''
                );
                if (!versionResult.ok) {
                  console.warn('[autosave] 版本存储失败:', versionResult.error.message);
                }
              }
            } catch (err) {
              console.warn('[autosave] 版本存储异常:', err);
            }
          }
        } else {
          // 主保存失败 → localStorage 兜底
          writeFallback(documentId, { content, mdxContent });
          setSaveStatus('conflict');
        }
      } catch (err) {
        console.warn('[autosave] 保存失败:', err);
        // 异常兜底
        writeFallback(documentId, { content: content });
        setSaveStatus('error');
      }
    },
    [documentId]
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

  // beforeunload — show confirmation if unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // cleanup timer on unmount
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
