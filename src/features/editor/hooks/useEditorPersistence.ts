import { useRef } from 'react';
import { useAutoSave } from './useAutosave';
import { importMdx } from '../engine/mdx/index';
import { exportMdx } from '../engine/mdx/index';
import type { PersistenceAdapter } from '../engine/types';
import type { ImportResult } from '../engine/mdx/import-mdx';

export function useEditorPersistence(docId: string, adapter: PersistenceAdapter) {
  const frontmatterRef = useRef<Record<string, unknown>>({});
  const { saveStatus, triggerSave, loadDraft, flushImmediate } = useAutoSave(
    docId,
    adapter,
    1000,
    // 自动保存时带上当前文档 frontmatter，避免保存后元信息丢失
    () => frontmatterRef.current
  );

  const sourceMdxRef = useRef('');
  const lastValidJsonRef = useRef<Record<string, unknown> | null>(null);

  const importMdxContent = async (mdx: string): Promise<ImportResult> => {
    const result = importMdx(mdx);
    frontmatterRef.current = result.frontmatter;
    sourceMdxRef.current = mdx;
    return result;
  };

  const exportMdxContent = async (
    json: Record<string, unknown>,
    frontmatter: Record<string, unknown> = {}
  ): Promise<string> => {
    const nodes =
      typeof json === 'object' && json !== null && 'content' in json ? (json as { content: unknown[] }).content : [];
    const result = exportMdx(nodes as Parameters<typeof exportMdx>[0], frontmatter);
    sourceMdxRef.current = result.mdx;
    return result.mdx;
  };

  return {
    saveStatus,
    triggerSave,
    loadDraft,
    flushImmediate,
    importMdxContent,
    exportMdxContent,
    sourceMdxRef,
    frontmatterRef,
    lastValidJsonRef,
  };
}
