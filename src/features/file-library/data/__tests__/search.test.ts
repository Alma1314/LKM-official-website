import { describe, expect, it } from "vitest";
import type { FileEntry } from "../../../../lib/api/modules/file-library";
import { searchFiles } from "../search";

function mk(
  id: number,
  file?: Partial<Omit<FileEntry, "id" | "reviewComment">>,
): FileEntry {
  return {
    id,
    originalName: "默认名.pdf",
    uploaderName: "某用户",
    mimeType: "application/pdf",
    size: 100,
    categoryId: "physics-quantum",
    categoryName: "量子力学",
    description: "默认简介",
    tags: [],
    status: "approved",
    reviewComment: null,
    downloadCount: 0,
    viewCount: 0,
    createdAt: "2026-07-15T08:00:00Z",
    ...file,
  };
}

describe("searchFiles", () => {
  const files = [
    mk(1, { originalName: "量子力学导论_讲义.pdf", tags: ["量子", "讲义"] }),
    mk(2, { description: "整理的天体物理公开数据集", uploaderName: "七月O" }),
    mk(3, { categoryName: "线性代数" }),
  ];

  it("按文件名命中", () => {
    const res = searchFiles(files, "量子力学导论");
    expect(res.map((f) => f.id)).toEqual([1]);
  });

  it("按标签/简介/上传者/分类名命中", () => {
    expect(searchFiles(files, "讲义").map((f) => f.id)).toEqual([1]);
    expect(searchFiles(files, "天体").map((f) => f.id)).toEqual([2]);
    expect(searchFiles(files, "七月O").map((f) => f.id)).toEqual([2]);
    expect(searchFiles(files, "线性").map((f) => f.id)).toEqual([3]);
  });

  it("大小写不敏感", () => {
    // categoryName「量子力学」下找（无英文场景），用 uploaderName 造英文测试
    const en = [mk(4, { uploaderName: "Alice Liu" })];
    expect(searchFiles(en, "alice").map((f) => f.id)).toEqual([4]);
    expect(searchFiles(en, "ALICE").map((f) => f.id)).toEqual([4]);
  });

  it("query 为空或纯空白返回 []", () => {
    expect(searchFiles(files, "")).toEqual([]);
    expect(searchFiles(files, "   ")).toEqual([]);
  });

  it("无命中返回空数组", () => {
    expect(searchFiles(files, "不存在的词")).toEqual([]);
  });
});
