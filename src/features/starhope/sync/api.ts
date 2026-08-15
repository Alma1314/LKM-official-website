import { get, post } from '~/lib/http/client';
import type { StarHopeEntity } from './mapping';

export interface StarHopePullData {
  items: Record<string, unknown>[];
  tombstones: { id: string; deleted_at: string }[];
  server_time: string;
}

export interface StarHopePushResult {
  synced: number;
  server_time: string;
}

export const starhopeApi = {
  pull: (entity: StarHopeEntity, since?: string) =>
    get<StarHopePullData>(`/api/v1/starhope/${entity}`, since ? { since } : undefined),
  push: (entity: StarHopeEntity, upserts: Record<string, unknown>[], deletes: { id: string; deleted_at: string }[]) =>
    post<StarHopePushResult>(`/api/v1/starhope/${entity}/sync`, { upserts, deletes }),
};
