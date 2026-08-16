import type { NavBarLink } from "~/types/config";

/**
 * 官网默认顶栏一级菜单（原官方 navbar 的 4 项），供无显式 navItems 的布局兜底。
 * 值为菜单 name（即 i18n key），与 allMenuItems 中对应菜单的 name 匹配。
 */
export const officialDefaultNavItems: string[] = [
  "nav.home",
  "nav.news",
  "nav.help",
  "nav.team",
];

/**
 * 全站统一导航菜单池（原 config.yaml fuwari.navbar 与 fuwari.navbarCommunity 合并）。
 * 页面用 navItems 白名单（name，即 i18n key）从该池中挑选要显示的一级菜单。
 * 渲染层通过 t(name) 显示本地化文本。
 */
export const allMenuItems: NavBarLink[] = [
  {
    name: "nav.home",
    url: "/",
    children: [
      { name: "nav.intro", url: "/" },
      { name: "nav.teamMembers", url: "/#team" },
      { name: "nav.timeline", url: "/#timeline" },
      { name: "nav.recentUpdates", url: "/#update" },
      { name: "nav.faq", url: "/#faq" },
    ],
  },
  {
    name: "nav.community",
    url: "/community",
    children: [
      { name: "nav.communityHome", url: "/community" },
      { name: "nav.forum", url: "/community/forum" },
      { name: "nav.columns", url: "/community/columns" },
      { name: "nav.qa", url: "/official/qa" },
      { name: "nav.competition", url: "/community/competition" },
    ],
  },
  {
    name: "nav.news",
    url: "/official/news",
    children: [
      { name: "nav.officialAnnouncement", url: "/official/news/announcement" },
      { name: "nav.techNews", url: "/official/news/news" },
      { name: "nav.science", url: "/official/news/science" },
    ],
  },
  {
    name: "nav.help",
    url: "/official/articles",
    children: [
      { name: "nav.articleList", url: "/official/articles" },
      { name: "nav.allCategories", url: "/official/articles/categories" },
      { name: "nav.articleArchive", url: "/official/articles/archive" },
      { name: "nav.aboutArticles", url: "/official/articles/about" },
    ],
  },
  {
    name: "nav.team",
    url: "/official/team",
    children: [
      { name: "nav.managementTeam", url: "/official/team" },
      { name: "nav.projectTeam", url: "/official/project-team" },
      { name: "nav.aboutUs", url: "/blog/about" },
      { name: "nav.services", url: "/official/services" },
      { name: "nav.sponsorship", url: "/official/pricing" },
      { name: "nav.contactUs", url: "/official/contact" },
      { name: "nav.qqCommunity", url: "/official/communities" },
    ],
  },
  {
    name: "nav.blog",
    url: "/blog",
    children: [
      { name: "nav.blogList", url: "/blog" },
      { name: "nav.allCategories", url: "/blog/categories" },
      { name: "nav.archive", url: "/blog/archive" },
      { name: "nav.aboutBlog", url: "/blog/about" },
    ],
  },
  {
    name: "nav.resources",
    url: "/community/forum",
    children: [
      { name: "nav.forum", url: "/community/forum" },
      { name: "nav.columns", url: "/community/columns" },
      { name: "nav.fileLibrary", url: "/community/files" },
      { name: "nav.qa", url: "/official/qa" },
      { name: "nav.projects", url: "/official/projects" },
      { name: "nav.competition", url: "/community/competition" },
      { name: "nav.funding", url: "/official/funding" },
      { name: "nav.moreApps", url: "/apps" },
    ],
  },
  {
    name: "nav.mine",
    url: "/account",
    children: [
      { name: "nav.profile", url: "/account" },
      { name: "nav.contribution", url: "/contribution" },
      { name: "nav.settings", url: "/account" },
    ],
  },
];
