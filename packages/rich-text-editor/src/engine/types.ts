import type { Editor } from '@tiptap/core';
import type { ReactNode } from 'react';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error' | 'conflict';
export type EditorMode = 'richtext' | 'source' | 'preview';
export type FrontmatterValues = Record<string, unknown>;

export interface ToolbarItem {
  key: string;
  icon: ReactNode;
  label: string;
  title: string;
  group: 'format' | 'heading' | 'block' | 'list' | 'insert' | 'history';
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

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

export interface DocumentVersion {
  version: number;
  contentMdx: string;
  editorJson: Record<string, unknown>;
  message: string;
  createdAt: string;
}

export interface PublishPayload {
  title: string;
  slug: string;
  contentMdx: string;
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

export interface CommentThread {
  id: string;
  range: { from: number; to: number };
  text: string;
  resolved: boolean;
  comments: CommentReply[];
  createdAt: string;
}

export interface CommentReply {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

export interface PersistenceAdapter {
  loadDocument(id: string): Promise<DocumentData | null> | DocumentData | null;
  saveDocument(doc: DocumentData): Promise<boolean> | boolean | void;
  deleteDocument(id: string): Promise<boolean> | boolean | void;
  listDocuments(): Promise<DocumentSummary[]> | DocumentSummary[];
  saveVersion(docId: string, doc: DocumentData, message?: string): Promise<boolean> | boolean | void;
  getVersions(docId: string): Promise<VersionEntry[]> | VersionEntry[];
  createBackup(
    docId: string,
    data: { docId: string; title: string; contentMdx: string; editorJson: unknown; status: string; version: number }
  ): Promise<boolean> | boolean | void;
  getBackups(): Promise<BackupEntry[]> | BackupEntry[];
  saveComment?(thread: CommentThread): void;
  getComments?(docId: string): CommentThread[];
  addThread?(docId: string, range: { from: number; to: number }, text: string, initialComment?: string): CommentThread;
  addReply?(docId: string, threadId: string, text: string): CommentReply | null;
  resolveThread?(docId: string, threadId: string): void;
  reopenThread?(docId: string, threadId: string): void;
  deleteThread?(docId: string, threadId: string): void;
}
