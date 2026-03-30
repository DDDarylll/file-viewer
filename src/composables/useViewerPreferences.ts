import { watch, type Ref } from 'vue'

const KEYS = {
  sidebarWidth: 'fv.sidebarWidth',
  wordWrap: 'fv.wordWrap',
  theme: 'fv.theme',
  markdownPreview: 'fv.markdownPreview',
} as const

export type ThemeMode = 'system' | 'light' | 'dark'

function readNumber(key: string, min: number, max: number, fallback: number): number {
  const raw = localStorage.getItem(key)
  if (raw == null) return fallback
  const n = parseInt(raw, 10)
  if (Number.isNaN(n) || n < min || n > max) return fallback
  return n
}

function readBool(key: string, defaultVal: boolean): boolean {
  const raw = localStorage.getItem(key)
  if (raw === null) return defaultVal
  return raw === '1' || raw === 'true'
}

function readTheme(): ThemeMode {
  const raw = localStorage.getItem(KEYS.theme) as ThemeMode | null
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  return 'system'
}

function readMarkdownPreview(): boolean {
  return readBool(KEYS.markdownPreview, false)
}

export function applyThemeToDocument(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', mode)
  }
}

/** 当前是否为「暗色」编辑区（system 时跟系统）。 */
export function isEffectiveDark(mode: ThemeMode): boolean {
  if (mode === 'dark') return true
  if (mode === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function useViewerPreferences() {
  const sidebarWidth = readNumber(KEYS.sidebarWidth, 200, 480, 280)
  const wordWrap = readBool(KEYS.wordWrap, true)
  const theme = readTheme()
  const markdownPreviewSplit = readMarkdownPreview()

  return {
    initialSidebarWidth: sidebarWidth,
    initialWordWrap: wordWrap,
    initialTheme: theme,
    initialMarkdownPreviewSplit: markdownPreviewSplit,
    persistSidebarWidth(width: number) {
      localStorage.setItem(KEYS.sidebarWidth, String(width))
    },
    persistWordWrap(value: boolean) {
      localStorage.setItem(KEYS.wordWrap, value ? '1' : '0')
    },
    persistTheme(mode: ThemeMode) {
      localStorage.setItem(KEYS.theme, mode)
      applyThemeToDocument(mode)
    },
    persistMarkdownPreviewSplit(value: boolean) {
      localStorage.setItem(KEYS.markdownPreview, value ? '1' : '0')
    },
  }
}

export function watchSidebarWidthPersist(width: Ref<number>, persist: (w: number) => void) {
  let t: ReturnType<typeof setTimeout> | null = null
  watch(width, (w) => {
    if (t) clearTimeout(t)
    t = setTimeout(() => persist(w), 300)
  })
}
