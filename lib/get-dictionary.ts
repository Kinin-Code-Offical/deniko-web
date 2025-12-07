import 'server-only'
import type { Locale } from '@/i18n-config'
import type { Dictionary } from '@/types/i18n'

const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    tr: () => import('@/dictionaries/tr.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  const getDict = dictionaries[locale] ?? dictionaries.tr
  const dict = await getDict()
  return dict as unknown as Dictionary
}