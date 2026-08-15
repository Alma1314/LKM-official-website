import type { NavBarLink } from '~/types/config';

/** 官网默认顶栏一级菜单（原官方 navbar 的 4 项），供无显式 navItems 的布局兜底。 */
export const officialDefaultNavItems: string[] = ['主页', '新闻资讯', '寻求帮助', '七月团队'];

/**
 * 全站统一导航菜单池（原 config.yaml fuwari.navbar 与 fuwari.navbarCommunity 合并）。
 * 页面用 navItems 白名单从该池中挑选要显示的一级菜单。
 */
export const allMenuItems: NavBarLink[] = [
  {
    name: '主页',
    url: '/',
    children: [
      { name: '简明介绍', url: '/' },
      { name: '团队成员', url: '/#team' },
      { name: '发展历程', url: '/#timeline' },
      { name: '最近更新', url: '/#update' },
      { name: '常见问题', url: '/#faq' },
    ],
  },
  {
    name: '社区主页',
    url: '/community',
    children: [
      { name: '社区首页', url: '/community' },
      { name: '板块广场', url: '/community/forum' },
      { name: '专栏', url: '/community/columns' },
      { name: '帮助/求助', url: '/official/qa' },
      { name: '竞赛', url: '/community/competition' },
    ],
  },
  {
    name: '新闻资讯',
    url: '/official/news',
    children: [
      { name: '官方公告', url: '/official/news/announcement' },
      { name: '科技新闻', url: '/official/news/news' },
      { name: '科普相关', url: '/official/news/science' },
    ],
  },
  {
    name: '寻求帮助',
    url: '/official/articles',
    children: [
      { name: '文章列表', url: '/official/articles' },
      { name: '所有分类', url: '/official/articles/categories' },
      { name: '文章归档', url: '/official/articles/archive' },
      { name: '关于文章', url: '/official/articles/about' },
    ],
  },
  {
    name: '七月团队',
    url: '/official/team',
    children: [
      { name: '管理团队', url: '/official/team' },
      { name: '项目团队', url: '/official/project-team' },
      { name: '关于我们', url: '/blog/about' },
      { name: '服务', url: '/official/services' },
      { name: '赞助与支持', url: '/official/pricing' },
      { name: '联系我们', url: '/official/contact' },
      { name: 'QQ社群', url: '/official/communities' },
    ],
  },
  {
    name: '博客',
    url: '/blog',
    children: [
      { name: '博客列表', url: '/blog' },
      { name: '所有分类', url: '/blog/categories' },
      { name: '博客归档', url: '/blog/archive' },
      { name: '关于博客', url: '/blog/about' },
    ],
  },
  {
    name: '资源',
    url: '/community/forum',
    children: [
      { name: '板块广场', url: '/community/forum' },
      { name: '专栏', url: '/community/columns' },
      { name: '文件库', url: '/community/files' },
      { name: '帮助/求助', url: '/official/qa' },
      { name: '项目大厅', url: '/official/projects' },
      { name: '竞赛', url: '/community/competition' },
      { name: '资助系统', url: '/official/funding' },
      { name: '其他应用', url: '/apps' },
    ],
  },
  {
    name: '我的',
    url: '/account',
    children: [
      { name: '个人主页', url: '/account' },
      { name: '贡献系统', url: '/contribution' },
      { name: '设置', url: '/account' },
    ],
  },
];
