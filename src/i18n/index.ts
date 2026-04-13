import { createI18n } from 'vue-i18n'
import { readInitialLocale } from '@/locale-preference'
import zhCN from '@/locales/zh-CN'
import enUS from '@/locales/en-US'

export const i18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: readInitialLocale(),
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})
