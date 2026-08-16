import type { en } from './languages/en';

export type Locale = 'en' | 'zh-CN';

export type TranslationDict = typeof en;

export type DeepKeyOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DeepKeyOf<T[K]>}`;
}[keyof T & string];

export type TranslationKey = DeepKeyOf<TranslationDict>;

export type DeepStringRecord<T> = {
  [K in keyof T & string]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

export type TranslationParams = Record<string, string | number | boolean>;

export const SUPPORTED_LOCALES: Locale[] = ['en', 'zh-CN'];

export const LOCALE_STORAGE_KEY = 'lkm-locale';
