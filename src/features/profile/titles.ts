export interface TitleInfo {
  name: string;
  color: string;
}

/** 称号 key → 展示名 + 颜色（key 与后端 Profile.title 对齐） */
export const TITLE_MAP: Record<string, TitleInfo> = {
  newbie: { name: '初来乍到', color: '#9ca3af' },
  active: { name: '活跃用户', color: '#22c55e' },
  hardcore: { name: '硬核答主', color: '#3b82f6' },
  file_master: { name: '文件达人', color: '#9333ea' },
  project_pioneer: { name: '项目先锋', color: '#f97316' },
  columnist: { name: '专栏作者', color: 'var(--color-primary)' },
};

export function titleInfoOf(key: string | undefined): TitleInfo {
  return TITLE_MAP[key || ''] || TITLE_MAP.newbie;
}
