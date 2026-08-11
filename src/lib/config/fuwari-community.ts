import type { NavBarConfig, NavBarLink } from '~/types/config';
import { LinkPreset } from '~/types/config';
import projectConfigRaw from 'virtual:config-community';

// virtual:config-community 运行时数据无编译期类型 —— 在此唯一断言一次
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectConfig = projectConfigRaw as Record<string, any>;

interface FuwariLinkItem {
  preset?: string;
  name?: string;
  url?: string;
  external?: boolean;
  children?: FuwariLinkItem[];
}

const cfg = projectConfig.fuwari as
  | {
      navbar?: { links: FuwariLinkItem[] };
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

const navCfg = cfg?.navbar ?? { links: [] };

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
