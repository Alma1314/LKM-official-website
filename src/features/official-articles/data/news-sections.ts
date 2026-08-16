// 新闻资讯板块子分类配置
//
// label：与后端分类名称精确匹配的展示名（保留中文用于匹配）；
// labelKey：i18n 展示 key；fallbackSlug：后端分类端点无精确匹配（name 相同）时的兜底 slug。

export interface NewsSection {
  label: string;
  labelKey: string;
  fallbackSlug: string;
}

export const NEWS_SECTIONS: NewsSection[] = [
  { label: '官方公告', labelKey: 'newsSections.announcement', fallbackSlug: 'announcement' },
  { label: '科技新闻', labelKey: 'newsSections.news', fallbackSlug: 'news' },
  { label: '科普相关', labelKey: 'newsSections.science', fallbackSlug: 'science' },
];
