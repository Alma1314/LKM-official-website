import type {
  ExpressiveCodeConfig,
  LicenseConfig,
  NavBarConfig,
  NavBarLink,
  ProfileConfig,
  SiteConfig,
} from './types/config';
import { LinkPreset } from './types/config';
import yaml from 'js-yaml';

// Vite ?raw import — content is inlined at build time, no fs.readFileSync at runtime
import rawYaml from './config.yaml?raw';

interface FuwariConfig {
  site?: Record<string, unknown>;
  navbar?: { links: FuwariLinkItem[] };
  profile?: Record<string, unknown>;
  license?: Record<string, unknown>;
  expressiveCode?: { theme: string };
}

interface FuwariLinkItem {
  preset?: string;
  name?: string;
  url?: string;
  external?: boolean;
  children?: FuwariLinkItem[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectConfig: Record<string, any> = yaml.load(rawYaml) as any;
const cfg = (projectConfig.fuwari || {}) as FuwariConfig;

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

const siteCfg = cfg.site ?? {};
const navCfg = cfg.navbar ?? { links: [] };
const profileCfg = cfg.profile ?? {};
const licCfg = cfg.license ?? {};
const ecCfg = cfg.expressiveCode ?? { theme: 'github-dark' };

export const siteConfig: SiteConfig = {
  title: String(siteCfg.title || 'Fuwari'),
  subtitle: String(siteCfg.subtitle || ''),
  lang: String(siteCfg.lang || 'en') as SiteConfig['lang'],
  themeColor: {
    hue: Number((siteCfg.themeColor as Record<string, unknown> | undefined)?.hue ?? 250),
    fixed: Boolean((siteCfg.themeColor as Record<string, unknown> | undefined)?.fixed ?? false),
  },
  banner: {
    enable: Boolean((siteCfg.banner as Record<string, unknown> | undefined)?.enable ?? false),
    src: String((siteCfg.banner as Record<string, unknown> | undefined)?.src || 'assets/images/demo-banner.png'),
    position: String((siteCfg.banner as Record<string, unknown> | undefined)?.position || 'center') as
      'top' | 'center' | 'bottom' | undefined,
    credit: {
      enable: Boolean(
        ((siteCfg.banner as Record<string, unknown> | undefined)?.credit as Record<string, unknown> | undefined)
          ?.enable ?? false
      ),
      text: String(
        ((siteCfg.banner as Record<string, unknown> | undefined)?.credit as Record<string, unknown> | undefined)
          ?.text || ''
      ),
      url: String(
        ((siteCfg.banner as Record<string, unknown> | undefined)?.credit as Record<string, unknown> | undefined)?.url ||
          ''
      ),
    },
  },
  toc: {
    enable: Boolean((siteCfg.toc as Record<string, unknown> | undefined)?.enable ?? true),
    depth: Number((siteCfg.toc as Record<string, unknown> | undefined)?.depth ?? 2) as 1 | 2 | 3,
  },
  favicon: Array.isArray(siteCfg.favicon) ? (siteCfg.favicon as SiteConfig['favicon']) : [],
};

function buildLinks(items: FuwariLinkItem[]): NavBarLink[] {
  return items.flatMap((link: FuwariLinkItem) => {
    if (link.preset) {
      // Expand a preset into a concrete NavBarLink
      const preset = presetFromString(link.preset);
      if (typeof preset === 'number') {
        const map: Record<number, { name: string; url: string; external?: boolean }> = {
          [LinkPreset.Home]: { name: 'Home', url: '/' },
          [LinkPreset.Archive]: { name: 'Archive', url: '/archive' },
          [LinkPreset.About]: { name: 'About', url: '/about' },
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

// ──────────────────────────────────────────────
// 通用站点配置（原 config.shared.ts）
// ──────────────────────────────────────────────

interface SharedSiteConfig {
  name: string;
  site?: string;
  base?: string;
  trailingSlash?: boolean;
  googleSiteVerificationId?: string;
}

interface I18NConfig {
  language: string;
  textDirection: string;
}

interface MetaDataConfig {
  title: { default: string; template: string };
  description: string;
  robots: { index: boolean; follow: boolean };
  openGraph: { type: string; site_name?: string; images?: { url: string; width: number; height: number }[] };
  twitter: { handle?: string; site?: string; cardType?: string };
}

interface AppBlogConfig {
  isEnabled: boolean;
  postsPerPage: number;
  isRelatedPostsEnabled: boolean;
  relatedPostsCount: number;
  post: { isEnabled: boolean; permalink: string; robots: { index: boolean; follow: boolean } };
  list: { isEnabled: boolean; pathname: string; robots: { index: boolean; follow: boolean } };
  category: { isEnabled: boolean; pathname: string; robots: { index: boolean; follow: boolean } };
  tag: { isEnabled: boolean; pathname: string; robots: { index: boolean; follow: boolean } };
}

interface SharedUIConfig {
  theme: string;
}

interface SharedAnalyticsConfig {
  vendors: { googleAnalytics: { id?: string } };
}

const site = projectConfig.site ?? {};
const i18n = projectConfig.i18n ?? {};
const metadata = projectConfig.metadata ?? {};
const apps = projectConfig.apps ?? {};
const blog = apps.blog ?? {};
const uiCfg = projectConfig.ui ?? {};
const analyticsCfg = projectConfig.analytics ?? {};

export const SITE: SharedSiteConfig = {
  name: site.name ?? 'Website',
  site: site.site ?? undefined,
  base: site.base ?? '/',
  trailingSlash: site.trailingSlash ?? false,
  googleSiteVerificationId: site.googleSiteVerificationId ?? undefined,
};

export const I18N: I18NConfig = {
  language: i18n.language ?? 'en',
  textDirection: i18n.textDirection ?? 'ltr',
};

export const METADATA: MetaDataConfig = {
  title: {
    default: metadata.title?.default ?? SITE.name,
    template: metadata.title?.template ?? '%s',
  },
  description: metadata.description ?? '',
  robots: {
    index: metadata.robots?.index ?? false,
    follow: metadata.robots?.follow ?? false,
  },
  openGraph: {
    type: metadata.openGraph?.type ?? 'website',
    site_name: metadata.openGraph?.site_name,
    images: (metadata.openGraph?.images as Array<Record<string, unknown>> | undefined)?.map((img) => ({
      url: img.url as string,
      width: img.width as number,
      height: img.height as number,
    })),
  },
  twitter: {
    handle: metadata.twitter?.handle,
    site: metadata.twitter?.site,
    cardType: metadata.twitter?.cardType,
  },
};

export const APP_BLOG: AppBlogConfig = {
  isEnabled: blog.isEnabled ?? false,
  postsPerPage: blog.postsPerPage ?? 6,
  isRelatedPostsEnabled: blog.isRelatedPostsEnabled ?? false,
  relatedPostsCount: blog.relatedPostsCount ?? 4,
  post: {
    isEnabled: blog.post?.isEnabled ?? true,
    permalink: blog.post?.permalink ?? '/blog/%slug%',
    robots: { index: blog.post?.robots?.index ?? true, follow: blog.post?.robots?.follow ?? true },
  },
  list: {
    isEnabled: blog.list?.isEnabled ?? true,
    pathname: blog.list?.pathname ?? 'blog',
    robots: { index: blog.list?.robots?.index ?? true, follow: blog.list?.robots?.follow ?? true },
  },
  category: {
    isEnabled: blog.category?.isEnabled ?? true,
    pathname: blog.category?.pathname ?? 'category',
    robots: { index: blog.category?.robots?.index ?? true, follow: blog.category?.robots?.follow ?? true },
  },
  tag: {
    isEnabled: blog.tag?.isEnabled ?? true,
    pathname: blog.tag?.pathname ?? 'tag',
    robots: { index: blog.tag?.robots?.index ?? false, follow: blog.tag?.robots?.follow ?? true },
  },
};

export const UI: SharedUIConfig = {
  theme: uiCfg.theme ?? 'system',
};

export const ANALYTICS: SharedAnalyticsConfig = {
  vendors: {
    googleAnalytics: {
      id: analyticsCfg.vendors?.googleAnalytics?.id ?? undefined,
    },
  },
};
