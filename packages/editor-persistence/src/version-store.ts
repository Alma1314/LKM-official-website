import type { DocumentData } from '@lkm/rich-text-editor';
import { ok, err, AppError } from './document-store';
import type { Result } from './document-store';

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
  } catch (err) {
    console.warn('[version-store] 读取版本失败:', err);
    return [];
  }
}

export function saveVersion(docId: string, doc: DocumentData, message = ''): Result<void> {
  try {
    const versions = getVersions(docId);
    const entry: VersionEntry = {
      version: doc.version,
      contentMdx: doc.contentMdx,
      editorJson: doc.editorJson ?? {},
      message: message || `版本 ${doc.version}`,
      createdAt: new Date().toISOString(),
    };

    versions.unshift(entry);

    if (versions.length > MAX_VERSIONS) {
      versions.length = MAX_VERSIONS;
    }

    localStorage.setItem(getKey(docId), JSON.stringify(versions));
    return ok(undefined);
  } catch (e) {
    console.warn('[version-store] 保存版本失败:', e);
    return err(new AppError('VERSION_SAVE_FAILED', '保存版本失败', e));
  }
}

export function getVersion(docId: string, version: number): VersionEntry | undefined {
  return getVersions(docId).find((v) => v.version === version);
}

export function clearVersions(docId: string): void {
  localStorage.removeItem(getKey(docId));
}
