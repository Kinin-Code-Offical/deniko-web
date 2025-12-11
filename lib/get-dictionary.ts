import "server-only";
import type { Locale } from "@/i18n-config";
import type { Dictionary } from "@/types/i18n";
import { i18n } from "@/i18n-config";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  tr: () => import("@/dictionaries/tr.json").then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  // Validate locale to prevent prototype pollution or unexpected method calls
  const validLocale = i18n.locales.includes(locale)
    ? locale
    : i18n.defaultLocale;
  const getDict = dictionaries[validLocale];
  const dict = await getDict();
  return dict as unknown as Dictionary;
};
