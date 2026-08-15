import type { NavBarLink } from '~/types/config';
import { getPermalink, getAsset } from './utils/permalinks';

/** 按一级菜单名（name）白名单过滤顶栏链接；names 未传(undefined)时不过滤，原样返回；空数组会返回空列表。 */
export function filterNavbarByNames(links: NavBarLink[], names?: string[]): NavBarLink[] {
  if (!names) return links;
  return links.filter((item) => names.includes(item.name));
}

export const footerData = {
  links: [
    {
      title: '社区',
      links: [
        { text: '七月团队', href: getPermalink('/blog/about') },
        { text: '管理团队', href: getPermalink('/official/team') },
        { text: '发展历程', href: getPermalink('/#timeline') },
        { text: '寻求帮助', href: getPermalink('/official/articles') },
      ],
    },
    {
      title: '页面',
      links: [
        { text: '服务', href: getPermalink('/official/services') },
        { text: '支持我们', href: getPermalink('/official/pricing') },
        { text: '联系我们', href: getPermalink('/official/contact') },
        { text: '常见问题', href: getPermalink('/#faq') },
      ],
    },
    {
      title: '法律',
      links: [
        { text: '隐私政策', href: getPermalink('/official/privacy') },
        { text: '使用条款', href: getPermalink('/official/terms') },
      ],
    },
  ],
  secondaryLinks: [
    { text: '使用条款', href: getPermalink('/official/terms') },
    { text: '隐私政策', href: getPermalink('/official/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/LKM-AHZ' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    理科迷 LKM &copy; 2026 · 保留所有权利。
  `,
};
