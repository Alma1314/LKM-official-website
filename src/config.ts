import type { ExpressiveCodeConfig, LicenseConfig, NavBarConfig, ProfileConfig, SiteConfig } from './types/config';
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
}

const projectConfig = yaml.load(rawYaml) as Record<string, unknown>;
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

export const navBarConfig: NavBarConfig = {
  links: navCfg.links.map((link: FuwariLinkItem) => {
    if (link.preset) return presetFromString(link.preset);
    return { name: link.name ?? '', url: link.url ?? '', external: link.external ?? false };
  }),
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
