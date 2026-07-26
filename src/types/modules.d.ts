declare module '@lkm/rich-text-editor' {
  import type { ComponentType } from 'react';
  import type { Editor } from '@tiptap/core';

  export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error' | 'conflict';
  export type EditorMode = 'richtext' | 'source' | 'preview';

  export interface DocumentMeta {
    id: string;
    title: string;
    lastModified: string;
    status: 'draft' | 'published' | 'archived';
    version: number;
  }

  export interface DocumentData extends DocumentMeta {
    contentMdx: string;
    editorJson: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
  }

  export interface DocumentSummary {
    id: string;
    title: string;
    lastModified: string;
    status: 'draft' | 'published' | 'archived';
    version: number;
  }

  export interface VersionEntry {
    version: number;
    contentMdx: string;
    editorJson: Record<string, unknown>;
    message: string;
    createdAt: string;
  }

  export interface BackupEntry {
    id: number;
    docId: string;
    title: string;
    timestamp: string;
  }

  export interface CommentReply {
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }

  export interface CommentThread {
    id: string;
    range: { from: number; to: number };
    text: string;
    resolved: boolean;
    comments: CommentReply[];
    createdAt: string;
  }

  export interface AutosavePayload {
    contentMdx: string;
    editorJson: Record<string, unknown>;
    baseVersion: number;
  }

  export interface AutosaveResponse {
    ok: boolean;
    version: number;
    code?: 'VERSION_CONFLICT';
    currentVersion?: number;
  }

  export interface PersistenceAdapter {
    loadDocument(id: string): Promise<DocumentData | null> | DocumentData | null;
    saveDocument(doc: DocumentData): Promise<boolean> | boolean | void;
    deleteDocument(id: string): Promise<boolean> | boolean | void;
    listDocuments(): Promise<DocumentSummary[]> | DocumentSummary[];
    saveVersion(docId: string, doc: DocumentData, message?: string): Promise<boolean> | boolean | void;
    getVersions(docId: string): Promise<VersionEntry[]> | VersionEntry[];
    createBackup(docId: string, data: { docId: string; title: string; contentMdx: string; editorJson: unknown; status: string; version: number }): Promise<boolean> | boolean | void;
    getBackups(): Promise<BackupEntry[]> | BackupEntry[];
    saveComment?(thread: CommentThread): void;
    getComments?(docId: string): CommentThread[];
    addThread?(docId: string, range: { from: number; to: number }, text: string, initialComment?: string): CommentThread;
    addReply?(docId: string, threadId: string, text: string): CommentReply | null;
    resolveThread?(docId: string, threadId: string): void;
    reopenThread?(docId: string, threadId: string): void;
    deleteThread?(docId: string, threadId: string): void;
  }

  export interface EditorMountProps {
    adapter: PersistenceAdapter;
  }

  export interface ImportResult {
    content: unknown[];
    frontmatter: Record<string, unknown>;
    issues?: Array<{ message: string; severity: 'warning' | 'error' }>;
  }

  export interface ExportResult {
    mdx: string;
  }

  export const EditorMount: ComponentType<EditorMountProps>;
  export function getEditorExtensions(placeholder?: string): ReturnType<Editor['extensionManager']>;
  export function exportMdx(content: unknown[], frontmatter?: Record<string, unknown>): ExportResult;
  export function importMdx(mdx: string): ImportResult;
  export function useEditorPersistence(docId: string, adapter: PersistenceAdapter): {
    saveStatus: SaveStatus;
    triggerSave: (content: Record<string, unknown>) => void;
    loadDraft: () => DocumentData | null;
    flushImmediate: (content: Record<string, unknown>) => void;
    importMdxContent: (mdx: string) => Promise<ImportResult>;
    exportMdxContent: (json: Record<string, unknown>, frontmatter?: Record<string, unknown>) => Promise<string>;
    sourceMdxRef: { current: string };
    frontmatterRef: { current: Record<string, unknown> };
    lastValidJsonRef: { current: Record<string, unknown> | null };
  };
  export function useAutoSave(documentId: string, adapter: PersistenceAdapter, debounceMs?: number): {
    saveStatus: SaveStatus;
    triggerSave: (content: Record<string, unknown>) => void;
    loadDraft: () => DocumentData | null;
    flushImmediate: (content: Record<string, unknown>) => void;
  };
}

declare module '@lkm/editor-persistence' {
  import type { PersistenceAdapter, DocumentData, DocumentSummary, CommentThread } from '@lkm/rich-text-editor';

  export function createLocalPersistence(): PersistenceAdapter;
  export function listDocuments(): DocumentSummary[];
  export function deleteDocument(id: string): void;
  export type { DocumentData, CommentThread };
}
