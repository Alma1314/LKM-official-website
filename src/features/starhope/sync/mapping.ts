export type StarHopeEntity = "questions" | "folders" | "sessions" | "agents";

const KEY_MAP: Record<string, string> = {
  userId: "user_id",
  folderId: "folder_id",
  createdAt: "created_at",
  updatedAt: "updated_at",
  questionIds: "question_ids",
  startedAt: "started_at",
  completedAt: "completed_at",
  timeLimit: "time_limit",
  passingGrade: "passing_grade",
  systemPrompt: "system_prompt",
  topP: "top_p",
  maxTokens: "max_tokens",
  parentId: "parent_id",
};

const REVERSE_KEY_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([camel, snake]) => [snake, camel]),
);

function mapKeys(
  obj: Record<string, unknown>,
  toSnake: boolean,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const mapped = toSnake ? (KEY_MAP[k] ?? k) : (REVERSE_KEY_MAP[k] ?? k);
    out[mapped] = v;
  }
  return out;
}

/** 前端 camelCase → API snake_case；push 时丢弃 userId（后端以 JWT 为准）。 */
export function toSnake(record: unknown): Record<string, unknown> {
  const mapped = mapKeys(record as Record<string, unknown>, true);
  delete mapped.user_id;
  return mapped;
}

/** API snake_case → 前端 camelCase；userId 由 int 转 string。 */
export function fromSnake(record: unknown): Record<string, unknown> {
  const mapped = mapKeys(record as Record<string, unknown>, false);
  if (mapped.userId !== undefined) mapped.userId = String(mapped.userId);
  return mapped;
}
