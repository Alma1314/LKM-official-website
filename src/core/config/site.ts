import projectConfigRaw from 'virtual:config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectConfig: Record<string, any> = projectConfigRaw as any;

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
