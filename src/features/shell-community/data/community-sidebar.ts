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

import { getPermalink } from '~/lib/utils/permalinks';

export interface CommunitySidebarLink {
  text: string;
  href: string;
  icon: string;
}

/** 社区核心功能入口 */
export const communitySidebarLinks: CommunitySidebarLink[] = [
  { text: 'nav.home', href: getPermalink('/community'), icon: 'material-symbols:home-outline-rounded' },
  { text: 'nav.forum', href: getPermalink('/community/forum'), icon: 'material-symbols:forum-outline' },
  { text: 'nav.columns', href: getPermalink('/community/columns'), icon: 'material-symbols:article-outline' },
  { text: 'nav.fileLibrary', href: getPermalink('/community/files'), icon: 'material-symbols:folder-outline' },
  { text: 'nav.qa', href: getPermalink('/official/qa'), icon: 'material-symbols:help-outline' },
  { text: 'nav.projects', href: getPermalink('/official/projects'), icon: 'material-symbols:rocket-launch-outline' },
  { text: 'nav.competition', href: getPermalink('/community/competition'), icon: 'tabler:trophy' },
  { text: 'nav.funding', href: getPermalink('/official/funding'), icon: 'material-symbols:volunteer-activism-outline' },
  { text: 'nav.qqCommunity', href: getPermalink('/official/communities'), icon: 'tabler:brand-qq' },
];

/** 用户个人相关 */
export const userSidebarLinks: CommunitySidebarLink[] = [
  { text: 'nav.profile', href: getPermalink('/profile'), icon: 'material-symbols:person-outline' },
  { text: 'nav.contribution', href: getPermalink('/contribution'), icon: 'material-symbols:stars-outline' },
  { text: 'nav.settings', href: getPermalink('/account'), icon: 'material-symbols:settings-outline' },
];
