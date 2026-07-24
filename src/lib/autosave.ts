import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '~/editor/types';
import { autosave as apiAutosave, getDocument } from './document-api';
import { exportMdx } from '~/editor/mdx';
import { saveBackup } from './backup-store';
import { saveVersion } from './version-store';

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
            });
          }

          // 版本快照节流：同一文档同一分钟内最多一次
          const now = Date.now();
          if (now - lastVersionSaveRef.current > 60_000) {
            lastVersionSaveRef.current = now;
            try {
              const doc = getDocument(documentId);
              if (doc && mdxContent) {
                saveVersion(
                  documentId,
                  { ...doc, contentMdx: mdxContent, editorJson: content, version: result.version },
                  ''
                );
              }
            } catch (err) {
              console.warn('[autosave] 版本存储失败:', err);
            }
          }
        } else {
          setSaveStatus('conflict');
        }
      } catch (err) {
        console.warn('[autosave] 保存失败:', err);
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

  // beforeunload — show confirmation if unsaved, flush synchronously if closing
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
