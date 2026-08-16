import { I18N } from "~/lib/config";
import type { Locale, TranslationKey, TranslationParams } from "./types";
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from "./types";
import { en } from "./languages/en";
import { zh_CN } from "./languages/zh_CN";
import { getSsrCookie } from "~/lib/ssr-context";

const DICTS: Record<Locale, Record<string, string>> = {
  en: flatten(en),
  "zh-CN": flatten(zh_CN),
};

const COOKIE_KEY = "lkm-locale";

/** 将嵌套词典扁平化为 `a.b.c` 路径 → 字符串 */
function flatten(
  dict: Record<string, unknown>,
  prefix = "",
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(dict)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value;
    } else if (value && typeof value === "object") {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    }
  }
  return out;
}

/** 根据配置默认语言推断 Locale */
function localeFromConfig(): Locale {
  const lang = (I18N.language || "").toLowerCase().replace("_", "-");
  if (lang.startsWith("en")) return "en";
  return "zh-CN";
}

/** 根据原始语言标记推断支持的 Locale */
function normalizeLocale(raw: string | null | undefined): Locale {
  if (!raw) return localeFromConfig();
  const lang = raw.toLowerCase().replace("_", "-");
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("zh")) return "zh-CN";
  return localeFromConfig();
}

/** 解析当前 Locale —— SSR 优先读请求 Cookie，CSR 优先读 localStorage，缺省回落到站点配置语言 */
export function getLocale(): Locale {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && (SUPPORTED_LOCALES as string[]).includes(stored))
        return stored as Locale;
    } catch {
      /* noop */
    }
    return localeFromConfig();
  }
  // SSR：优先读请求 Cookie（语言切换后刷新页面可保持）
  const cookie = getSsrCookie();
  if (cookie) {
    const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`));
    if (match) {
      const parsed = normalizeLocale(decodeURIComponent(match[1]));
      if (SUPPORTED_LOCALES.includes(parsed)) return parsed;
    }
  }
  return localeFromConfig();
}

/** 设置并持久化当前 Locale（写入 localStorage + Cookie，SSR 靠 Cookie 读取） */
export function setLocale(locale: Locale): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(locale)};path=/;max-age=31536000;samesite=lax`;
      document.documentElement.setAttribute("lang", locale);
      window.dispatchEvent(
        new CustomEvent("lkm:locale-change", { detail: { locale } }),
      );
    } catch {
      /* noop */
    }
  }
}

/** 插值：将 `{name}` 占位符替换为参数 */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** 翻译入口。key 类型为 TranslationKey（字典路径），但运行时也支持任意字符串（未命中时原样返回）。 */
export function t(
  key: TranslationKey | string | undefined | null,
  params?: TranslationParams,
): string {
  if (!key) return "";
  const locale = getLocale();
  const template = DICTS[locale][key] ?? DICTS.en[key] ?? key;
  return interpolate(template, params);
}

export { en, zh_CN };
export type { Locale, TranslationKey, TranslationParams };
