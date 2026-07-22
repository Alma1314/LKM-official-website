import type { DocumentData, DocumentMeta, AutosavePayload, AutosaveResponse } from '~/editor/types';

const DRAFTS_KEY = 'lkm-editor-drafts';
const DRAFTS_INDEX_KEY = 'lkm-editor-drafts-index';

function readDrafts(): Record<string, DocumentData> {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDrafts(drafts: Record<string, DocumentData>): void {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

function readIndex(): DocumentMeta[] {
  try {
    const raw = localStorage.getItem(DRAFTS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIndex(index: DocumentMeta[]): void {
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
