export const LOCALE_KEY = 'fv.locale'

export type AppLocale = 'zh-CN' | 'en-US'

export function readInitialLocale(): AppLocale {
  if (typeof localStorage === 'undefined') return 'zh-CN'
  const raw = localStorage.getItem(LOCALE_KEY)
  if (raw === 'en-US') return 'en-US'
  return 'zh-CN'
}

export function writeLocale(locale: AppLocale) {
  localStorage.setItem(LOCALE_KEY, locale)
}
