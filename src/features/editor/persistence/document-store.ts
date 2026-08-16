import { ok, err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { t } from '~/lib/i18n';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

import type { DocumentData, DocumentMeta, DocumentSummary, AutosavePayload, AutosaveResponse } from '../engine/types';

const DRAFTS_KEY = 'lkm-editor-drafts';
const DRAFTS_INDEX_KEY = 'lkm-editor-drafts-index';

// 内存缓存：减少 autosave 高频触发的 JSON.parse 开销
let draftsCache: Record<string, DocumentData> | null = null;
let indexCache: DocumentMeta[] | null = null;

function readDrafts(): Record<string, DocumentData> {
  if (draftsCache) return draftsCache;
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    draftsCache = raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('[document-api] readDrafts 失败:', err);
    draftsCache = {};
  }
  return draftsCache ?? {};
}

function writeDrafts(drafts: Record<string, DocumentData>): Result<void, AppError> {
  try {
    draftsCache = drafts;
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return ok(undefined);
  } catch (e) {
    return err(new AppError('DB_WRITE_FAILED', t('editor.persistence.writeFailed'), e));
  }
}

function readIndex(): DocumentMeta[] {
  if (indexCache) return indexCache;
  try {
    const raw = localStorage.getItem(DRAFTS_INDEX_KEY);
    indexCache = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[document-api] readIndex 失败:', err);
    indexCache = [];
  }
  return indexCache ?? [];
}

function writeIndex(index: DocumentMeta[]): Result<void, AppError> {
  try {
    indexCache = index;
    localStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(index));
    return ok(undefined);
  } catch (e) {
    return err(new AppError('DB_WRITE_FAILED', t('editor.persistence.writeIndexFailed'), e));
  }
}

export function getDocument(id: string): DocumentData | null {
  try {
    const drafts = readDrafts();
    return drafts[id] ?? null;
  } catch (e) {
    console.warn('[document-api] getDocument 失败:', e);
    return null;
  }
}

export function listDocuments(): DocumentSummary[] {
  return readIndex();
}

export function createDocument(title?: string): Result<DocumentData, AppError> {
  try {
    const now = new Date().toISOString();
    const doc: DocumentData = {
      id: crypto.randomUUID(),
      title: title ?? t('editor.untitled'),
      contentMdx: '',
      editorJson: null,
      status: 'draft',
      version: 1,
      lastModified: now,
      createdAt: now,
      updatedAt: now,
    };

    const drafts = readDrafts();
    drafts[doc.id] = doc;
    const wd = writeDrafts(drafts);
    if (!wd.isOk()) return err(wd.error);

    const index = readIndex();
    index.unshift({
      id: doc.id,
      title: doc.title,
      lastModified: doc.lastModified,
      status: doc.status,
      version: doc.version,
    });
    writeIndex(index);
    return ok(doc);
  } catch (e) {
    return err(new AppError('DB_WRITE_FAILED', t('editor.persistence.createFailed'), e));
  }
}

export function updateDocument(id: string, data: Partial<DocumentData>): Result<DocumentData | null, AppError> {
  try {
    const drafts = readDrafts();
    const existing = drafts[id];
    if (!existing) return ok(null);

    const updated: DocumentData = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    drafts[id] = updated;
    const wd = writeDrafts(drafts);
    if (!wd.isOk()) return err(wd.error);

    const index = readIndex();
    const idx = index.findIndex((m) => m.id === id);
    if (idx !== -1) {
      index[idx] = {
        id: updated.id,
        title: updated.title,
        lastModified: updated.lastModified,
        status: updated.status,
        version: updated.version,
      };
      writeIndex(index);
    }

    return ok(updated);
  } catch (e) {
    return err(new AppError('DB_WRITE_FAILED', t('editor.persistence.updateFailed'), e));
  }
}

export function autosave(id: string, payload: AutosavePayload): AutosaveResponse {
  const drafts = readDrafts();
  const existing = drafts[id];

  if (existing && existing.version !== payload.baseVersion) {
    return { ok: false, version: existing.version, code: 'VERSION_CONFLICT', currentVersion: existing.version };
  }

  const now = new Date().toISOString();
  const newVersion = (existing?.version ?? 0) + 1;

  const doc: DocumentData = {
    id,
    title: existing?.title ?? t('editor.untitled'),
    contentMdx: payload.contentMdx,
    editorJson: payload.editorJson,
    status: existing?.status ?? 'draft',
    version: newVersion,
    lastModified: now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  drafts[id] = doc;
  writeDrafts(drafts);

  const index = readIndex();
  const idx = index.findIndex((m) => m.id === id);
  const meta: DocumentMeta = {
    id: doc.id,
    title: doc.title,
    lastModified: doc.lastModified,
    status: doc.status,
    version: doc.version,
  };
  if (idx !== -1) {
    index[idx] = meta;
  } else {
    index.unshift(meta);
  }
  writeIndex(index);

  return { ok: true, version: newVersion };
}

export function deleteDocument(id: string): Result<void, AppError> {
  try {
    const drafts = readDrafts();
    delete drafts[id];
    const wd = writeDrafts(drafts);
    if (!wd.isOk()) return wd;

    const index = readIndex();
    return writeIndex(index.filter((m) => m.id !== id));
  } catch (e) {
    return err(new AppError('DB_DELETE_FAILED', t('editor.persistence.deleteFailed'), e));
  }
}
