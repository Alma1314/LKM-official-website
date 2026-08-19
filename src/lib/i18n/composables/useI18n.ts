import { ref, watch } from "vue";
import { t as tGlobal, ensureDict, getLocale } from "../index";
import type { Locale, TranslationKey, TranslationParams } from "../types";
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES } from "../types";

function resolveInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && (SUPPORTED_LOCALES as string[]).includes(stored))
      return stored as Locale;
  } catch {
    /* noop */
  }
  return getLocale();
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
    // 预热目标语词典（不阻塞；命中即缓存供 t 后续同步读取）
    void ensureDict(next);
  }

  // 跟随响应式 locale，用共享注册表翻译（回退链与全局 t 一致）
  const t = (
    key: TranslationKey | string | undefined | null,
    params?: TranslationParams,
  ): string => {
    if (!key) return "";
    void ensureDict(locale.value); // 未就绪则触发拉载，本次调用可能回退原 key
    return tGlobal(key, params);
  };

  watch(locale, (val) => {
    document.documentElement.setAttribute("lang", val);
    void ensureDict(val);
  });

  return { locale, setLocale, t };
}
