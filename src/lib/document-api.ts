import type { DocumentData, DocumentMeta, AutosavePayload, AutosaveResponse } from '~/editor/types';

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

function writeDrafts(drafts: Record<string, DocumentData>): void {
  draftsCache = drafts;
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
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

function writeIndex(index: DocumentMeta[]): void {
  indexCache = index;
  localStorage.setItem(DRAFTS_INDEX_KEY, JSON.stringify(index));
}

export function getDocument(id: string): DocumentData | null {
  const drafts = readDrafts();
  return drafts[id] ?? null;
}

export function listDocuments(): DocumentMeta[] {
  return readIndex();
}

export function createDocument(title?: string): DocumentData {
  const now = new Date().toISOString();
  const doc: DocumentData = {
    id: crypto.randomUUID(),
    title: title ?? '无标题文档',
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
  writeDrafts(drafts);

  const index = readIndex();
  index.unshift({
    id: doc.id,
    title: doc.title,
    lastModified: doc.lastModified,
    status: doc.status,
    version: doc.version,
  });
  writeIndex(index);

  return doc;
}

export function updateDocument(id: string, data: Partial<DocumentData>): DocumentData | null {
  const drafts = readDrafts();
  const existing = drafts[id];
  if (!existing) return null;

  const updated: DocumentData = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };
  drafts[id] = updated;
  writeDrafts(drafts);

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

  return updated;
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
    title: existing?.title ?? '无标题文档',
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

export function deleteDocument(id: string): void {
  const drafts = readDrafts();
  delete drafts[id];
  writeDrafts(drafts);

  const index = readIndex();
  writeIndex(index.filter((m) => m.id !== id));
}
