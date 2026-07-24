import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import yaml from "js-yaml";

// Vite ?raw import — content is inlined at build time, no fs.readFileSync at runtime
import rawYaml from "./config.yaml?raw";

const projectConfig = yaml.load(rawYaml) as Record<string, any>;
const cfg = (projectConfig.fuwari || {}) as Record<string, any>;

function presetFromString(s: string): LinkPreset {
	switch (s) {
		case "Home": return LinkPreset.Home;
		case "Archive": return LinkPreset.Archive;
		case "About": return LinkPreset.About;
		default: return LinkPreset.Home;
	}
}

export const siteConfig: SiteConfig = {
	title: cfg.site?.title || "Fuwari",
	subtitle: cfg.site?.subtitle || "",
	lang: cfg.site?.lang || "en",
	themeColor: {
		hue: cfg.site?.themeColor?.hue ?? 250,
		fixed: cfg.site?.themeColor?.fixed ?? false,
	},
	banner: {
		enable: cfg.site?.banner?.enable ?? false,
		src: cfg.site?.banner?.src || "assets/images/demo-banner.png",
		position: cfg.site?.banner?.position || "center",
		credit: {
			enable: cfg.site?.banner?.credit?.enable ?? false,
			text: cfg.site?.banner?.credit?.text || "",
			url: cfg.site?.banner?.credit?.url || "",
		},
	},
	toc: {
		enable: cfg.site?.toc?.enable ?? true,
		depth: cfg.site?.toc?.depth ?? 2,
	},
	favicon: (cfg.site?.favicon as any[]) || [],
};

export const navBarConfig: NavBarConfig = {
	links: (cfg.navbar?.links || []).map((link: any) => {
		if (link.preset) return presetFromString(link.preset);
		return { name: link.name, url: link.url, external: link.external ?? false };
	}),
};

export const profileConfig: ProfileConfig = {
	avatar: cfg.profile?.avatar || "assets/images/demo-avatar.png",
	name: cfg.profile?.name || "",
	bio: cfg.profile?.bio || "",
	links: (cfg.profile?.links || []).map((link: any) => ({
		name: link.name,
		url: link.url,
		icon: link.icon,
	})),
};

export const licenseConfig: LicenseConfig = {
	enable: cfg.license?.enable ?? true,
	name: cfg.license?.name || "CC BY-NC-SA 4.0",
	url: cfg.license?.url || "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: cfg.expressiveCode?.theme || "github-dark",
};
