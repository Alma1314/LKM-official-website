import { ref, watch } from "vue";
import { I18N } from "~/lib/config";
import type { Locale, TranslationKey, TranslationParams } from "../types";
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from "../types";
import { en } from "../languages/en";
import { zh_CN } from "../languages/zh_CN";

const DICTS: Record<Locale, Record<string, string>> = {
  en: flatten(en),
  "zh-CN": flatten(zh_CN),
};

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

function resolveInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && (SUPPORTED_LOCALES as string[]).includes(stored))
      return stored as Locale;
  } catch {
    /* noop */
  }
  return localeFromConfig();
}

function localeFromConfig(): Locale {
  const lang = (I18N.language || "").toLowerCase().replace("_", "-");
  if (lang.startsWith("en")) return "en";
  return "zh-CN";
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function useI18n(): {
  locale: import("vue").Ref<Locale>;
  setLocale: (next: Locale) => void;
  t: (
    key: TranslationKey | string | undefined | null,
    params?: TranslationParams,
  ) => string;
} {
  const locale = ref<Locale>(resolveInitialLocale());

  function setLocale(next: Locale): void {
    locale.value = next;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
      document.cookie = `lkm-locale=${encodeURIComponent(next)};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* noop */
    }
    document.documentElement.setAttribute("lang", next);
    window.dispatchEvent(
      new CustomEvent("lkm:locale-change", { detail: { locale: next } }),
    );
  }

  const t = (
    key: TranslationKey | string | undefined | null,
    params?: TranslationParams,
  ): string => {
    if (!key) return "";
    const template = DICTS[locale.value][key] ?? DICTS.en[key] ?? key;
    return interpolate(template, params);
  };

  watch(locale, (val) => {
    document.documentElement.setAttribute("lang", val);
  });

  return { locale, setLocale, t };
}
