import type { DocumentData } from '~/editor/types';

export interface VersionEntry {
  version: number;
  contentMdx: string;
  editorJson: Record<string, unknown>;
  message: string;
  createdAt: string;
}

const MAX_VERSIONS = 50;

function getKey(docId: string): string {
  return `lkm-editor-versions-${docId}`;
}

export function getVersions(docId: string): VersionEntry[] {
  try {
    const raw = localStorage.getItem(getKey(docId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveVersion(docId: string, doc: DocumentData, message = ''): void {
  const versions = getVersions(docId);
  const entry: VersionEntry = {
    version: doc.version,
    contentMdx: doc.contentMdx,
    editorJson: doc.editorJson ?? {},
    message: message || `版本 ${doc.version}`,
    createdAt: new Date().toISOString(),
  };

  versions.unshift(entry);

  // Keep only latest 50 versions
  if (versions.length > MAX_VERSIONS) {
    versions.length = MAX_VERSIONS;
  }

  localStorage.setItem(getKey(docId), JSON.stringify(versions));
}

export function getVersion(docId: string, version: number): VersionEntry | undefined {
  return getVersions(docId).find((v) => v.version === version);
}

export function clearVersions(docId: string): void {
  localStorage.removeItem(getKey(docId));
}
