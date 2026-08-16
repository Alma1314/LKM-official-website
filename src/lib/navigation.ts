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
      title: 'footer.community',
      links: [
        { text: 'nav.team', href: getPermalink('/blog/about') },
        { text: 'nav.managementTeam', href: getPermalink('/official/team') },
        { text: 'nav.timeline', href: getPermalink('/#timeline') },
        { text: 'nav.help', href: getPermalink('/official/articles') },
      ],
    },
    {
      title: 'footer.pages',
      links: [
        { text: 'nav.services', href: getPermalink('/official/services') },
        { text: 'footer.supportUs', href: getPermalink('/official/pricing') },
        { text: 'nav.contactUs', href: getPermalink('/official/contact') },
        { text: 'nav.faq', href: getPermalink('/#faq') },
      ],
    },
    {
      title: 'footer.legal',
      links: [
        { text: 'footer.privacyPolicy', href: getPermalink('/official/privacy') },
        { text: 'footer.terms', href: getPermalink('/official/terms') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'footer.terms', href: getPermalink('/official/terms') },
    { text: 'footer.privacyPolicy', href: getPermalink('/official/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/LKM-AHZ' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: 'footer.copyright',
};
