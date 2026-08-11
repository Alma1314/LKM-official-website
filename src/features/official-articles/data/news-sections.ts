// 新闻资讯板块子分类配置
//
// label：展示名称；fallbackSlug：后端分类端点无精确匹配（name 相同）时的兜底 slug。
// 后端分类端点返回的分类若与 label 名称完全一致，则优先使用其真实 slug 与文章数。

export interface NewsSection {
  label: string;
  fallbackSlug: string;
}

export const NEWS_SECTIONS: NewsSection[] = [
  { label: '官方公告', fallbackSlug: 'announcement' },
  { label: '科技新闻', fallbackSlug: 'news' },
  { label: '科普相关', fallbackSlug: 'science' },
];
