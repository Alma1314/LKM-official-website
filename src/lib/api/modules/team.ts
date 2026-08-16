import { get } from "../../http/client";

/** 团队成员（字段与后端 members.Member 对齐） */
export interface TeamMember {
  name?: string;
  avatarKey?: string;
  role?: string;
  desc?: string;
  dream?: string;
  quote?: string;
}

/** 子组集合元素（subGroupMaps 类型的分组结构） */
export interface TeamSubGroup {
  key: string;
  label: string;
  desc?: string;
  members: TeamMember[];
}

/** 后端 ListData 分页/列表包装 */
export interface ListData<T> {
  items: T[];
}

/**
 * 团队成员/项目成员 API。
 * 两者均由后端 members 模块提供：
 *  - memberLists 类型（founder/general/events/news/advisor/tech/alumni 等）走 `/api/v1/members`
 *  - subGroupMaps 类型（affairs/news/professional/project）走 `/api/v1/members/subgroups`
 */
export const teamApi = {
  /** 直接成员列表（memberLists 类型） */
  getMembers: (type: string) =>
    get<ListData<TeamMember>>(`/api/v1/members`, { type }),

  /** 子组集合完整分组结构（subGroupMaps 类型） */
  getSubGroups: (type: string) =>
    get<ListData<TeamSubGroup>>(`/api/v1/members/subgroups`, { type }),
};
