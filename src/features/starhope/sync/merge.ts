export interface TombstoneInput {
  id: string;
  deleted_at: string;
}

/**
 * 合并增量 pull 结果到本地记录（均为 camelCase 后的对象）。
 * 规则：items 里本地已有同 id 取 updatedAt 较新者；tombstone 以 deleted_at 参与比较，晚者胜。
 */
export function mergePull(
  local: Record<string, unknown>[],
  items: Record<string, unknown>[],
  tombstones: TombstoneInput[]
): Record<string, unknown>[] {
  const byId = new Map(local.map((r) => [r.id as string, r]));

  for (const item of items) {
    const id = item.id as string;
    const existing = byId.get(id);
    if (!existing || (item.updatedAt as string) >= (existing.updatedAt as string)) {
      byId.set(id, item);
    }
  }

  for (const tomb of tombstones) {
    const existing = byId.get(tomb.id);
    if (existing && tomb.deleted_at >= (existing.updatedAt as string)) {
      byId.delete(tomb.id);
    }
  }

  return [...byId.values()];
}
