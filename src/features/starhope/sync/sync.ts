import { db } from '../stores-vue/db';
import type { StarHopeEntity } from './mapping';
import { fromSnake, toSnake } from './mapping';
import { starhopeApi } from './api';
import { mergePull } from './merge';

const ENTITIES: StarHopeEntity[] = ['questions', 'folders', 'sessions', 'agents'];
const TABLE_BY_ENTITY: Record<StarHopeEntity, keyof typeof db> = {
  questions: 'questions',
  folders: 'folders',
  sessions: 'practiceSessions',
  agents: 'aiAgents',
};

const LAST_SYNC_KEY = (e: StarHopeEntity): string => `starhope-sync:${e}:lastSyncAt`;

function getLastSync(entity: StarHopeEntity): string | undefined {
  return localStorage.getItem(LAST_SYNC_KEY(entity)) ?? undefined;
}

function setLastSync(entity: StarHopeEntity, ts: string): void {
  localStorage.setItem(LAST_SYNC_KEY(entity), ts);
}

/** 登录后全量拉取并合并（首次 since 为空）。 */
export async function pullAll(): Promise<void> {
  for (const entity of ENTITIES) {
    const since = getLastSync(entity);
    const result = await starhopeApi.pull(entity, since);
    if (result.isErr()) {
      console.warn(`[starhope] pull ${entity} 失败，跳过`, result.error);
      continue;
    }
    const data = result.value;
    const table = db[TABLE_BY_ENTITY[entity]] as unknown as {
      toArray(): Promise<Record<string, unknown>[]>;
      bulkPut(rows: Record<string, unknown>[]): Promise<unknown>;
    };
    const local = (await table.toArray()).map((r) => fromSnake(r));
    const remote = data.items.map((r) => fromSnake(r));
    const merged = mergePull(
      local,
      remote,
      data.tombstones.map((t) => ({ id: t.id, deleted_at: t.deleted_at }))
    );
    await table.bulkPut(merged.map((r) => toSnake(r)));
    setLastSync(entity, data.server_time);
  }
}

/** 记录一条待推送操作，debounce 后 flush。 */
export function enqueue(entity: StarHopeEntity, entityId: string, op: 'upsert' | 'delete', payload?: unknown): void {
  void db.syncOps.add({
    entity,
    entityId,
    op,
    payload,
    updatedAt: new Date().toISOString(),
  });
  scheduleFlush();
}

let _flushTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleFlush(): void {
  if (_flushTimer) clearTimeout(_flushTimer);
  _flushTimer = setTimeout(() => {
    void flush();
  }, 300);
}

let _flushing = false;
let _flushQueued = false;

async function doFlush(): Promise<void> {
  const ops = await db.syncOps.toArray();
  if (ops.length === 0) return;

  for (const entity of ENTITIES) {
    const entityOps = ops.filter((o) => o.entity === entity);
    if (entityOps.length === 0) continue;

    const table = db[TABLE_BY_ENTITY[entity]] as unknown as {
      get(id: string): Promise<Record<string, unknown> | undefined>;
    };
    const upserts: Record<string, unknown>[] = [];
    const deletes: { id: string; deleted_at: string }[] = [];
    for (const op of entityOps) {
      if (op.op === 'delete') {
        deletes.push({ id: op.entityId, deleted_at: op.updatedAt });
      } else {
        const row = op.payload ?? (await table.get(op.entityId));
        if (row) upserts.push(toSnake(row));
      }
    }

    const result = await starhopeApi.push(entity, upserts, deletes);
    if (result.isErr()) continue; // 保留下次重试
    await db.syncOps.bulkDelete(entityOps.map((o) => o.id!));
    setLastSync(entity, result.value.server_time);
  }
}

/** 把 outbox 里所有待推记录按实体分组推送；成功才清对应 outbox。 */
export async function flush(): Promise<void> {
  if (_flushing) {
    _flushQueued = true;
    return;
  }
  _flushing = true;
  try {
    await doFlush();
  } finally {
    _flushing = false;
    if (_flushQueued) {
      _flushQueued = false;
      void flush();
    }
  }
}
