import { describe, it, expect } from "vitest";
import { mergePull } from "../sync/merge";

describe("mergePull 合并规则", () => {
  it("本地无同 id 时直接写入", () => {
    const out = mergePull([], [{ id: "q1", updatedAt: "2026-08-15" }], []);
    expect(out).toEqual([{ id: "q1", updatedAt: "2026-08-15" }]);
  });

  it("本地较新则保留本地", () => {
    const out = mergePull(
      [{ id: "q1", updatedAt: "2026-08-20", content: "local" }],
      [{ id: "q1", updatedAt: "2026-08-15", content: "remote" }],
      [],
    );
    expect(out[0].content).toBe("local");
  });

  it("云端较新则覆盖本地", () => {
    const out = mergePull(
      [{ id: "q1", updatedAt: "2026-08-10", content: "local" }],
      [{ id: "q1", updatedAt: "2026-08-15", content: "remote" }],
      [],
    );
    expect(out[0].content).toBe("remote");
  });

  it("tombstone 较新则删除本地", () => {
    const out = mergePull(
      [{ id: "q1", updatedAt: "2026-08-10" }],
      [],
      [{ id: "q1", deleted_at: "2026-08-15" }],
    );
    expect(out).toEqual([]);
  });

  it("tombstone 较旧则保留本地", () => {
    const out = mergePull(
      [{ id: "q1", updatedAt: "2026-08-20" }],
      [],
      [{ id: "q1", deleted_at: "2026-08-15" }],
    );
    expect(out.length).toBe(1);
  });
});
