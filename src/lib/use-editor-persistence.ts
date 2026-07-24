import { useRef } from 'react';
import { useAutoSave } from './autosave';
import { importMdx } from '~/editor/mdx';
import { exportMdx } from '~/editor/mdx';
import type { ImportResult } from '~/editor/mdx/import-mdx';

export function useEditorPersistence(docId: string) {
  const { saveStatus, triggerSave, loadDraft, flushImmediate } = useAutoSave(docId, 1000);

  const sourceMdxRef = useRef('');
  const frontmatterRef = useRef<Record<string, unknown>>({});
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
