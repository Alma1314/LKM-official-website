import type { DocumentData, VersionEntry } from "../engine/types";
import { ok, err } from "neverthrow";
import type { Result } from "neverthrow";
import { AppError } from "./document-store";
import { t } from "~/lib/i18n";

const MAX_VERSIONS = 50;

function getKey(docId: string): string {
  return `lkm-editor-versions-${docId}`;
}

export function getVersions(docId: string): VersionEntry[] {
  try {
    const raw = localStorage.getItem(getKey(docId));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("[version-store] 读取版本失败:", err);
    return [];
  }
}

export function saveVersion(
  docId: string,
  doc: DocumentData,
  message = "",
): Result<void, AppError> {
  try {
    const versions = getVersions(docId);
    const entry: VersionEntry = {
      version: doc.version,
      contentMdx: doc.contentMdx,
      editorJson: doc.editorJson ?? {},
      message:
        message ||
        t("editor.persistence.versionMessage", { version: doc.version }),
      createdAt: new Date().toISOString(),
    };

    versions.unshift(entry);

    if (versions.length > MAX_VERSIONS) {
      versions.length = MAX_VERSIONS;
    }

    localStorage.setItem(getKey(docId), JSON.stringify(versions));
    return ok(undefined);
  } catch (e) {
    console.warn("[version-store] 保存版本失败:", e);
    return err(
      new AppError(
        "VERSION_SAVE_FAILED",
        t("editor.persistence.saveVersionFailed"),
        e,
      ),
    );
  }
}

export function getVersion(
  docId: string,
  version: number,
): VersionEntry | undefined {
  return getVersions(docId).find((v) => v.version === version);
}

export function clearVersions(docId: string): void {
  localStorage.removeItem(getKey(docId));
}
