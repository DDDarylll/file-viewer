<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '@/locale-preference'
import type { ThemeMode } from '@/composables/useViewerPreferences'

defineProps<{
  loading: boolean
  rootName: string
  error: string
  locale: AppLocale
  themeMode: ThemeMode
}>()

const emit = defineEmits<{
  selectFolder: []
  selectSingleFile: []
  setLocale: [locale: AppLocale]
  setTheme: [mode: ThemeMode]
}>()

const { t } = useI18n()

const localeMenuOpen = ref(false)
const themeMenuOpen = ref(false)
const localeWrapRef = ref<HTMLElement | null>(null)
const themeWrapRef = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

function syncFullscreen() {
  isFullscreen.value = !!document.fullscreenElement
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch {
    /* 浏览器拒绝或不可用 */
  }
}

function closeMenus() {
  localeMenuOpen.value = false
  themeMenuOpen.value = false
}

function toggleLocaleMenu() {
  themeMenuOpen.value = false
  localeMenuOpen.value = !localeMenuOpen.value
}

function toggleThemeMenu() {
  localeMenuOpen.value = false
  themeMenuOpen.value = !themeMenuOpen.value
}

function onDocMouseDown(e: MouseEvent) {
  const target = e.target as Node
  if (localeWrapRef.value?.contains(target)) return
  if (themeWrapRef.value?.contains(target)) return
  closeMenus()
}

watch([localeMenuOpen, themeMenuOpen], ([loc, th]) => {
  if (loc || th) {
    nextTick(() => {
      document.addEventListener('mousedown', onDocMouseDown, true)
    })
  } else {
    document.removeEventListener('mousedown', onDocMouseDown, true)
  }
})

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreen)
  syncFullscreen()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocMouseDown, true)
  document.removeEventListener('fullscreenchange', syncFullscreen)
})

function pickLocale(code: AppLocale) {
  emit('setLocale', code)
  localeMenuOpen.value = false
}

function pickTheme(mode: ThemeMode) {
  emit('setTheme', mode)
  themeMenuOpen.value = false
}
</script>

<template>
  <header class="header">
    <div class="header-row">
      <div class="actions-left">
        <button class="btn" :disabled="loading" @click="$emit('selectFolder')">
          {{ loading ? t('header.loading') : t('header.selectFolder') }}
        </button>
        <button class="btn secondary" :disabled="loading" @click="$emit('selectSingleFile')">
          {{ t('header.openFile') }}
        </button>
      </div>
      <span v-if="rootName" class="root-name">{{ rootName }}</span>
      <div class="actions-right">
        <button
          type="button"
          class="icon-btn"
          :class="{ 'icon-btn-active': isFullscreen }"
          :title="
            isFullscreen ? t('header.tooltipFullscreenExit') : t('header.tooltipFullscreen')
          "
          :aria-label="
            isFullscreen ? t('header.fullscreenExit') : t('header.fullscreen')
          "
          :aria-pressed="isFullscreen"
          @click="toggleFullscreen"
        >
          <svg v-if="!isFullscreen" class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
          <svg v-else class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
            />
          </svg>
        </button>

        <div ref="localeWrapRef" class="menu-anchor" :class="{ 'is-open': localeMenuOpen }">
          <button
            type="button"
            class="icon-btn"
            :class="{ 'icon-btn-active': localeMenuOpen }"
            :title="t('header.tooltipLanguage')"
            :aria-label="t('header.language')"
            :aria-expanded="localeMenuOpen"
            aria-haspopup="menu"
            @click="toggleLocaleMenu"
          >
            <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a9 9 0 018.716 6.747M12 3a9 9 0 00-8.716 6.747"
              />
            </svg>
          </button>
          <div
            v-show="localeMenuOpen"
            class="dropdown-panel"
            role="menu"
            :aria-label="t('header.language')"
          >
            <button
              type="button"
              class="dropdown-row"
              :class="{ active: locale === 'zh-CN' }"
              role="menuitem"
              @click="pickLocale('zh-CN')"
            >
              中文
            </button>
            <button
              type="button"
              class="dropdown-row"
              :class="{ active: locale === 'en-US' }"
              role="menuitem"
              @click="pickLocale('en-US')"
            >
              English
            </button>
          </div>
        </div>

        <div ref="themeWrapRef" class="menu-anchor" :class="{ 'is-open': themeMenuOpen }">
          <button
            type="button"
            class="icon-btn"
            :class="{ 'icon-btn-active': themeMenuOpen }"
            :title="t('header.tooltipTheme')"
            :aria-label="t('header.theme')"
            :aria-expanded="themeMenuOpen"
            aria-haspopup="menu"
            @click="toggleThemeMenu"
          >
            <svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          </button>
          <div
            v-show="themeMenuOpen"
            class="dropdown-panel"
            role="menu"
            :aria-label="t('header.theme')"
          >
            <button
              type="button"
              class="dropdown-row"
              :class="{ active: themeMode === 'system' }"
              role="menuitem"
              @click="pickTheme('system')"
            >
              {{ t('theme.optionSystem') }}
            </button>
            <button
              type="button"
              class="dropdown-row"
              :class="{ active: themeMode === 'light' }"
              role="menuitem"
              @click="pickTheme('light')"
            >
              {{ t('theme.optionLight') }}
            </button>
            <button
              type="button"
              class="dropdown-row"
              :class="{ active: themeMode === 'dark' }"
              role="menuitem"
              @click="pickTheme('dark')"
            >
              {{ t('theme.optionDark') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <span v-if="error" class="error">{{ error }}</span>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  flex-wrap: wrap;
}

.actions-left,
.actions-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.actions-right {
  margin-left: auto;
  flex-shrink: 0;
}

.actions-left .btn {
  box-sizing: border-box;
  min-height: 36px;
  padding: 0 16px;
  font-size: 14px;
  line-height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 4px;
  white-space: nowrap;
}

.btn.secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:hover:not(:disabled) {
  filter: brightness(0.95);
}

.btn.secondary:hover:not(:disabled) {
  background: var(--color-border-hover);
  filter: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-anchor {
  position: relative;
  z-index: 1;
}

.menu-anchor.is-open {
  z-index: 80;
}

.icon-btn {
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.icon-btn:hover {
  background: var(--color-border-hover);
}

.icon-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon-btn-active {
  background: hsla(160, 100%, 37%, 0.15);
  border-color: hsla(160, 100%, 37%, 0.45);
}

.icon-svg {
  width: 20px;
  height: 20px;
}

.dropdown-panel {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 160px;
  padding: 4px 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.dropdown-row {
  display: block;
  width: 100%;
  padding: 8px 14px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  color: var(--color-text);
  border: none;
}

.dropdown-row:hover {
  background: var(--color-border-hover);
}

.dropdown-row.active {
  background: hsla(160, 100%, 37%, 0.12);
  font-weight: 500;
}

.root-name {
  flex: 1;
  min-width: 120px;
  font-size: 14px;
  color: var(--color-text);
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.error {
  color: #e74c3c;
  font-size: 14px;
}
</style>
