import Dexie, { type EntityTable } from "dexie";

export interface ImageRecord {
  id: string;
  blob: Blob;
  mime: string;
  width?: number;
  height?: number;
  /** 图片原始文件名，用于 `![[文件名]]` 附件语法复用 */
  orgName?: string;
  createdAt: string;
}

const imageDb = new Dexie("lkm-editor-images") as Dexie & {
  images: EntityTable<ImageRecord, "id">;
};

imageDb.version(1).stores({
  images: "id, createdAt, orgName",
});

/** 图片引用前缀：编辑器 JSON / MDX 中图片 src 用 `blob:<id>` 引用，避免 base64 塞满 localStorage */
export const BLOB_REF_PREFIX = "blob:";

function isBlobRef(src: string): boolean {
  return src.startsWith(BLOB_REF_PREFIX);
}

/** 从 blob 引用 id 中提取图片 id */
function parseBlobRefId(src: string): string | null {
  if (!isBlobRef(src)) return null;
  const id = src.slice(BLOB_REF_PREFIX.length);
  return id || null;
}

/**
 * 持久化一张图片 blob，返回 blob 引用 id（例如 `blob:abc-123`）。
 * 可选传入原始文件名 orgName 写入索引，供 `![[文件名]]` 附件语法按名复用。
 */
export async function saveImageBlob(
  blob: Blob,
  orgName?: string,
): Promise<string> {
  const id = crypto.randomUUID();
  let width: number | undefined;
  let height: number | undefined;

  // 尝试读取图片原始尺寸，做轻量元数据（失败则忽略）
  try {
    const bitmap = await createImageBitmap(blob);
    width = bitmap.width;
    height = bitmap.height;
    bitmap.close();
  } catch {
    // 非浏览器环境或解析失败，忽略
  }

  const record: ImageRecord = {
    id,
    blob,
    mime: blob.type || "application/octet-stream",
    width,
    height,
    createdAt: new Date().toISOString(),
  };
  if (orgName) record.orgName = orgName;
  await imageDb.images.put(record);
  return BLOB_REF_PREFIX + id;
}

const objectUrlCache = new Map<string, string>();

/**
 * 把图片 src 解析为可展示的 URL。
 * - `blob:<id>` → 从 IndexedDB 读取 blob 生成 ObjectURL（带内存缓存，刷新后重新生成）
 * - 其它（http/https/data 等）→ 原样返回
 */
export async function resolveImageSrc(src: string): Promise<string> {
  const id = parseBlobRefId(src);
  if (!id) return src;

  const cached = objectUrlCache.get(id);
  if (cached) return cached;

  const record = await imageDb.images.get(id);
  if (!record) {
    // 图片记录不存在（如已清理），返回占位
    return "";
  }
  const url = URL.createObjectURL(record.blob);
  objectUrlCache.set(id, url);
  return url;
}

/** 按原始文件名查最先匹配的图片，返回 `blob:<id>` 或 null（供 `![[文件名]]` 复用）。 */
export async function findImageByOrgName(
  orgName: string,
): Promise<string | null> {
  if (!orgName) return null;
  const match = await imageDb.images.where("orgName").equals(orgName).first();
  return match ? BLOB_REF_PREFIX + match.id : null;
}

/** 删除多张 blob 引用图片（释放 IndexedDB 占用）。供删除文档等场景调用。 */
export async function deleteImageBlobs(srcList: string[]): Promise<void> {
  await Promise.all(
    srcList.map(async (src) => {
      const id = parseBlobRefId(src);
      if (!id) return;
      const url = objectUrlCache.get(id);
      if (url) {
        URL.revokeObjectURL(url);
        objectUrlCache.delete(id);
      }
      await imageDb.images.delete(id);
    }),
  );
}

/** 从文档 editorJson 中收集所有图片 src（用于清理） */
export function collectImageSrcs(editorJson: unknown): string[] {
  const result: string[] = [];
  const walk = (value: unknown): void => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === "object") {
      const obj = value as Record<string, unknown>;
      const attrs = (obj.attrs ?? {}) as Record<string, unknown>;
      if (obj.type === "image" && typeof attrs.src === "string") {
        result.push(attrs.src);
      }
      for (const v of Object.values(obj)) walk(v);
    }
  };
  walk(editorJson);
  return result;
}
