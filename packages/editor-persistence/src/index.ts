import type {
  PersistenceAdapter,
  DocumentData,
  DocumentSummary,
  VersionEntry,
  BackupEntry,
  CommentReply,
} from '@lkm/rich-text-editor';
import {
  getDocument,
  listDocuments,
  createDocument as createDoc,
  updateDocument,
  deleteDocument,
} from './document-store';

// Re-export for direct consumer use (e.g. admin pages)
export { listDocuments, deleteDocument };
export type { DocumentData } from '@lkm/rich-text-editor';
import { saveBackup, getBackups } from './backup-store';
import { saveVersion, getVersions } from './version-store';
import { getThreads, addThread, addReply, resolveThread, reopenThread, deleteThread } from './comment-store';
import type { CommentThread } from './comment-store';

export function createLocalPersistence(): PersistenceAdapter {
  return {
    loadDocument: (id: string) => getDocument(id),

    saveDocument: async (doc: DocumentData): Promise<boolean> => {
      const existing = getDocument(doc.id);
      if (existing) {
        const result = updateDocument(doc.id, doc);
        return result.ok;
      }
      const result = createDoc(doc.title);
      return result.ok;
    },

    deleteDocument: async (id: string): Promise<boolean> => {
      const result = deleteDocument(id);
      return result.ok;
    },

    listDocuments: (): DocumentSummary[] => listDocuments(),

    saveVersion: async (docId: string, doc: DocumentData, message?: string): Promise<boolean> => {
      const result = saveVersion(docId, doc, message);
      return result.ok;
    },

    getVersions: (docId: string): VersionEntry[] => getVersions(docId),

    createBackup: async (
      docId: string,
      data: { docId: string; title: string; contentMdx: string; editorJson: unknown; status: string; version: number }
    ): Promise<boolean> => {
      const result = await saveBackup(docId, {
        docId,
        title: data.title,
        contentMdx: data.contentMdx,
        editorJson: data.editorJson,
        status: data.status,
        version: data.version,
        timestamp: new Date().toISOString(),
      } as Parameters<typeof saveBackup>[1]);
      return result.ok;
    },

    getBackups: async (): Promise<BackupEntry[]> => {
      const result = await getBackups();
      return result.ok ? result.value : [];
    },

    getComments: (docId: string): CommentThread[] => getThreads(docId),
    addThread: (
      docId: string,
      range: { from: number; to: number },
      text: string,
      initialComment?: string
    ): CommentThread => addThread(docId, range, text, initialComment),
    addReply: (docId: string, threadId: string, text: string): CommentReply | null => addReply(docId, threadId, text),
    resolveThread: (docId: string, threadId: string): void => {
      resolveThread(docId, threadId);
    },
    reopenThread: (docId: string, threadId: string): void => {
      reopenThread(docId, threadId);
    },
    deleteThread: (docId: string, threadId: string): void => {
      deleteThread(docId, threadId);
    },
  };
}

export type { CommentThread };
