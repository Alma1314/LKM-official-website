import { describe, it, expect } from "vitest";
import { toSnake, fromSnake } from "../sync/mapping";

describe("starhope 同步字段映射", () => {
  it("toSnake 映射 camelCase→snake_case 并丢弃 userId", () => {
    const out = toSnake({
      id: "q1",
      userId: "7",
      folderId: "f1",
      createdAt: "a",
      updatedAt: "b",
      content: "x",
    });
    expect(out).toEqual({
      id: "q1",
      folder_id: "f1",
      created_at: "a",
      updated_at: "b",
      content: "x",
    });
    expect(out.user_id).toBeUndefined();
  });

  it("toSnake 映射 AI 字段", () => {
    const out = toSnake({
      id: "a1",
      userId: "7",
      systemPrompt: "p",
      topP: 1,
      maxTokens: 100,
      updatedAt: "t",
    });
    expect(out).toEqual({
      id: "a1",
      system_prompt: "p",
      top_p: 1,
      max_tokens: 100,
      updated_at: "t",
    });
  });

  it("fromSnake 映射 snake_case→camelCase 且 userId 转字符串", () => {
    const out = fromSnake({
      id: "s1",
      user_id: 7,
      question_ids: ["q1"],
      started_at: "a",
      updated_at: "b",
    });
    expect(out).toEqual({
      id: "s1",
      userId: "7",
      questionIds: ["q1"],
      startedAt: "a",
      updatedAt: "b",
    });
  });
});
