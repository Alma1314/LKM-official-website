import type {
  ExpressiveCodeConfig,
  LicenseConfig,
  NavBarConfig,
  NavBarLink,
  ProfileConfig,
  SiteConfig,
} from '~/types/config';
import { LinkPreset } from '~/types/config';
import projectConfigRaw from 'virtual:config';

// virtual:config 运行时数据没有编译期类型 —— 在此唯一断言一次
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectConfig = projectConfigRaw as Record<string, any>;

interface FuwariLinkItem {
  preset?: string;
  name?: string;
  url?: string;
  external?: boolean;
  children?: FuwariLinkItem[];
}

interface RawCredit {
  enable?: boolean;
  text?: string;
  url?: string;
}

interface RawBanner {
  enable?: boolean;
  src?: string;
  position?: string;
  credit?: RawCredit;
}

interface RawThemeColor {
  hue?: number;
  fixed?: boolean;
}

interface RawToc {
  enable?: boolean;
  depth?: number;
}

interface RawSiteConfig {
  title?: string;
  subtitle?: string;
  lang?: string;
  themeColor?: RawThemeColor;
  banner?: RawBanner;
  toc?: RawToc;
  favicon?: unknown[];
}

const cfg = projectConfig.fuwari as
  | {
      site?: RawSiteConfig;
      navbar?: { links: FuwariLinkItem[] };
      profile?: Record<string, unknown>;
      license?: Record<string, unknown>;
      expressiveCode?: { theme: string };
    }
  | undefined;

function presetFromString(s: string): LinkPreset {
  switch (s) {
    case 'Home':
      return LinkPreset.Home;
    case 'Archive':
      return LinkPreset.Archive;
    case 'About':
      return LinkPreset.About;
    default:
      return LinkPreset.Home;
  }
}

const siteCfg = cfg?.site ?? {};
const navCfg = cfg?.navbar ?? { links: [] };
const profileCfg = cfg?.profile ?? {};
const licCfg = cfg?.license ?? {};
const ecCfg = cfg?.expressiveCode ?? { theme: 'github-dark' };

export const siteConfig: SiteConfig = {
  title: siteCfg.title || 'Fuwari',
  subtitle: siteCfg.subtitle || '',
  lang: (siteCfg.lang || 'en') as SiteConfig['lang'],
  themeColor: {
    hue: siteCfg.themeColor?.hue ?? 250,
    fixed: siteCfg.themeColor?.fixed ?? false,
  },
  banner: {
    enable: siteCfg.banner?.enable ?? false,
    src: siteCfg.banner?.src || 'assets/images/demo-banner.png',
    position: (siteCfg.banner?.position || 'center') as SiteConfig['banner']['position'],
    credit: {
      enable: siteCfg.banner?.credit?.enable ?? false,
      text: siteCfg.banner?.credit?.text || '',
      url: siteCfg.banner?.credit?.url || '',
    },
  },
  toc: {
    enable: siteCfg.toc?.enable ?? true,
    depth: (siteCfg.toc?.depth ?? 2) as 1 | 2 | 3,
  },
  favicon: Array.isArray(siteCfg.favicon) ? (siteCfg.favicon as SiteConfig['favicon']) : [],
};

function buildLinks(items: FuwariLinkItem[]): NavBarLink[] {
  return items.flatMap((link: FuwariLinkItem) => {
    if (link.preset) {
      const preset = presetFromString(link.preset);
      if (typeof preset === 'number') {
        const map: Record<number, { name: string; url: string; external?: boolean }> = {
          [LinkPreset.Home]: { name: 'Home', url: '/' },
          [LinkPreset.Archive]: { name: 'Archive', url: '/blog/archive' },
          [LinkPreset.About]: { name: 'About', url: '/blog/about' },
        };
        const resolved = map[preset];
        if (resolved) return [{ ...resolved, external: false }];
      }
      return [];
    }
    return [
      {
        name: link.name ?? '',
        url: link.url ?? '',
        external: link.external ?? false,
        ...(link.children ? { children: buildLinks(link.children) } : {}),
      },
    ];
  });
}

export const navBarConfig: NavBarConfig = {
  links: buildLinks(navCfg.links),
};

export const profileConfig: ProfileConfig = {
  avatar: String(profileCfg.avatar || 'assets/images/demo-avatar.png'),
  name: String(profileCfg.name || ''),
  bio: String(profileCfg.bio || ''),
  links: (Array.isArray(profileCfg.links) ? profileCfg.links : []) as ProfileConfig['links'],
};

export const licenseConfig: LicenseConfig = {
  enable: Boolean(licCfg.enable ?? true),
  name: String(licCfg.name || 'CC BY-NC-SA 4.0'),
  url: String(licCfg.url || 'https://creativecommons.org/licenses/by-nc-sa/4.0/'),
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
  theme: ecCfg.theme ?? 'github-dark',
};
