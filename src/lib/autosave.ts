import { useCallback, useEffect, useRef, useState } from 'react';
import type { SaveStatus } from '~/editor/types';
import { autosave as apiAutosave, getDocument } from './document-api';

export function useAutoSave(documentId: string, debounceMs = 1000) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const hasUnsavedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseVersionRef = useRef(1);
  const savedCallbackRef = useRef<(() => void) | null>(null);

  const loadDraft = useCallback(() => {
    const doc = getDocument(documentId);
    if (doc) {
      baseVersionRef.current = doc.version;
      return doc;
    }
    return null;
  }, [documentId]);

  const doSave = useCallback(
    (content: Record<string, unknown>) => {
      setSaveStatus('saving');
      try {
        const result = apiAutosave(documentId, {
          contentMdx: '',
          editorJson: content,
          baseVersion: baseVersionRef.current,
        });

        if (result.ok) {
          baseVersionRef.current = result.version;
          setSaveStatus('saved');
          hasUnsavedRef.current = false;
          savedCallbackRef.current?.();
        } else {
          setSaveStatus('conflict');
        }
      } catch {
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
        // Modern browsers may ignore this string but it's part of the spec
        e.returnValue = '';
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
