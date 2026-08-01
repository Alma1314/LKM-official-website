/**
 * 社区侧边栏统一配置
 *
 * 使用方式（在各页面 .astro 中）：
 *
 * import Layout from '~/layouts/SidebarLayout.astro';
 * import { communitySidebarLinks } from '~/features/shell-community/data/community-sidebar';
 *
 * <Layout
 *   metadata={{ title: '页面标题' }}
 *   sidebarLinks={communitySidebarLinks}
 *   currentPath={Astro.url.pathname}
 * >
 *   ... 页面内容
 * </Layout>
 */

import { getPermalink } from '~/core/utils/permalinks';

export interface CommunitySidebarLink {
  text: string;
  href: string;
  icon: string;
}

/** 社区核心功能入口 */
export const communitySidebarLinks: CommunitySidebarLink[] = [
  { text: '首页', href: getPermalink('/community'), icon: 'material-symbols:home-outline-rounded' },
  { text: '板块广场', href: getPermalink('/community/forum'), icon: 'material-symbols:forum-outline' },
  { text: '专栏', href: getPermalink('/community/columns'), icon: 'material-symbols:article-outline' },
  { text: '文件库', href: getPermalink('/community/files'), icon: 'material-symbols:folder-outline' },
  { text: '帮助/求助', href: getPermalink('/official/qa'), icon: 'material-symbols:help-outline' },
  { text: '项目大厅', href: getPermalink('/official/projects'), icon: 'material-symbols:rocket-launch-outline' },
  { text: '竞赛', href: getPermalink('/community/competition'), icon: 'tabler:trophy' },
  { text: '资助系统', href: getPermalink('/official/funding'), icon: 'material-symbols:volunteer-activism-outline' },
  { text: 'QQ社群', href: getPermalink('/official/communities'), icon: 'tabler:brand-qq' },
];

/** 用户个人相关 */
export const userSidebarLinks: CommunitySidebarLink[] = [
  { text: '个人主页', href: getPermalink('/profile'), icon: 'material-symbols:person-outline' },
  { text: '贡献系统', href: getPermalink('/contribution'), icon: 'material-symbols:stars-outline' },
  { text: '设置', href: getPermalink('/account'), icon: 'material-symbols:settings-outline' },
];
