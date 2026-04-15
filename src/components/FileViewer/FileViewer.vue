<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '@/locale-preference'
import FileTree from '../FileTree/index.vue'
import CodeEditor from '../CodeEditor/index.vue'
import AppHeader from '../AppHeader/index.vue'
import FileTabs from '../FileTabs/index.vue'
import EditorToolbar from '../EditorToolbar/index.vue'
import ImageViewer from '../ImageViewer/index.vue'
import MarkdownPreview from '../MarkdownPreview/index.vue'
import Toast from '../Toast/index.vue'
import { useResizableSidebar } from '@/composables/useResizableSidebar'
import {
  useViewerPreferences,
  applyThemeToDocument,
  watchSidebarWidthPersist,
  type ThemeMode,
} from '@/composables/useViewerPreferences'
import {
  useFileViewerWorkspace,
  type CodeEditorInstance,
} from '@/composables/useFileViewerWorkspace'
import { expandTreeToPath } from '@/utils/tree-expand'

const codeEditorRef = ref<CodeEditorInstance | null>(null)

const { t, locale } = useI18n()
const prefs = useViewerPreferences()
applyThemeToDocument(prefs.initialTheme)
const themeMode = ref<ThemeMode>(prefs.initialTheme)
const markdownPreviewSplit = ref(prefs.initialMarkdownPreviewSplit)
const systemDark = ref(
  typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches,
)

const { width: sidebarWidth, onResizeStart } = useResizableSidebar({
  initial: prefs.initialSidebarWidth,
})

watchSidebarWidthPersist(sidebarWidth, prefs.persistSidebarWidth)

const sidebarCollapsed = ref(prefs.initialSidebarCollapsed)

function toggleSidebarCollapsed() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  prefs.persistSidebarCollapsed(sidebarCollapsed.value)
}

const sidebarAsideStyle = computed(() =>
  sidebarCollapsed.value
    ? { width: '36px' }
    : { width: `${sidebarWidth.value}px` },
)

const editorDark = computed(() => {
  if (themeMode.value === 'dark') return true
  if (themeMode.value === 'light') return false
  return systemDark.value
})

function setLocale(code: AppLocale) {
  locale.value = code
  prefs.persistLocale(code)
}

function syncDocumentLocale() {
  const l = locale.value as AppLocale
  document.documentElement.lang = l === 'zh-CN' ? 'zh-CN' : 'en'
  document.title = t('app.title')
}

let mql: MediaQueryList | null = null
function onSystemSchemeChange(e: MediaQueryListEvent) {
  systemDark.value = e.matches
}

onMounted(() => {
  applyThemeToDocument(themeMode.value)
  syncDocumentLocale()
  mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', onSystemSchemeChange)
})

watch(locale, syncDocumentLocale)

onBeforeUnmount(() => {
  mql?.removeEventListener('change', onSystemSchemeChange)
})

function setTheme(mode: ThemeMode) {
  themeMode.value = mode
  prefs.persistTheme(mode)
}

function toggleMarkdownPreview() {
  markdownPreviewSplit.value = !markdownPreviewSplit.value
  prefs.persistMarkdownPreviewSplit(markdownPreviewSplit.value)
}

const {
  toastMessage,
  rootDirectoryHandle,
  rootNodes,
  rootName,
  openedFiles,
  activeFileId,
  error,
  loading,
  wordWrap,
  activeFile,
  selectFolder,
  selectSingleFile,
  reloadFile,
  copyPath,
  toggleWordWrap,
  toggleFind,
  downloadImage,
  closeFile,
  closeOtherTabs,
  closeTabsToTheRight,
  reorderTabs,
  restoreLastClosed,
  canEdit,
  startEdit,
  saveFile,
  cancelEdit,
  onEditorUpdate,
  switchToFile,
  onSelectFile,
} = useFileViewerWorkspace({
  codeEditorRef,
  initialWordWrap: prefs.initialWordWrap,
})

const isMarkdownFile = computed(() => {
  const n = activeFile.value?.name.toLowerCase() ?? ''
  return n.endsWith('.md') || n.endsWith('.markdown')
})
const findPanelOpen = ref(false)

function onSearchOpenChange(open: boolean) {
  findPanelOpen.value = open
}

watch(
  () => [activeFile.value?.path, rootNodes.value] as const,
  async ([path, nodes]) => {
    if (!path || !nodes?.length || !path.includes('/')) return
    await expandTreeToPath(nodes, path)
    await nextTick()
    await nextTick()
    try {
      const el = document.querySelector(`[data-tree-path="${CSS.escape(path)}"]`)
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    } catch {
      /* ignore invalid selector */
    }
  },
)
</script>

<template>
  <div class="app">
    <AppHeader
      :loading="loading"
      :root-name="rootName"
      :error="error"
      :locale="locale as AppLocale"
      :theme-mode="themeMode"
      @select-folder="selectFolder"
      @select-single-file="selectSingleFile"
      @set-theme="setTheme"
      @set-locale="setLocale"
    />

    <div class="main">
      <aside
        class="sidebar"
        :class="{ 'is-collapsed': sidebarCollapsed }"
        :style="sidebarAsideStyle"
      >
        <div v-if="!sidebarCollapsed" class="sidebar-tree-wrap">
          <FileTree
            :root-nodes="rootNodes"
            :root-directory-handle="rootDirectoryHandle"
            :root-path-prefix="rootName"
            :highlight-path="activeFile?.path ?? null"
            :show-collapse-button="true"
            @select-file="onSelectFile"
            @toggle-collapse="toggleSidebarCollapsed"
          />
        </div>
        <div v-else class="sidebar-collapsed-bar">
          <button
            type="button"
            class="sidebar-icon-btn"
            :title="t('fileView.tooltipExpandTree')"
            :aria-label="t('fileView.expandTree')"
            @click="toggleSidebarCollapsed"
          >
            <svg class="sidebar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </aside>
      <div
        v-show="!sidebarCollapsed"
        class="resize-handle"
        :title="t('fileView.resizeSidebar')"
        @mousedown="onResizeStart"
      />
      <section class="content">
        <FileTabs
          :files="openedFiles"
          :active-file-id="activeFileId"
          @switch="switchToFile"
          @close="(id, e) => closeFile(id, e)"
          @reorder="reorderTabs"
          @close-others="closeOtherTabs"
          @close-to-right="closeTabsToTheRight"
          @restore-closed="restoreLastClosed"
        />
        <EditorToolbar
          :file="activeFile"
          :word-wrap="wordWrap"
          :find-panel-open="findPanelOpen"
          :can-edit="canEdit"
          :unsupported-binary="activeFile?.unsupportedBinary === true"
          :is-markdown-file="isMarkdownFile"
          :markdown-preview-split="markdownPreviewSplit"
          @start-edit="startEdit"
          @save-file="saveFile"
          @cancel-edit="cancelEdit"
          @reload-file="reloadFile"
          @copy-path="copyPath"
          @toggle-word-wrap="toggleWordWrap"
          @toggle-find="toggleFind"
          @toggle-markdown-preview="toggleMarkdownPreview"
          @download-image="downloadImage"
        />
        <ImageViewer
          v-if="activeFile?.type === 'image' && activeFile.imageUrl"
          :src="activeFile.imageUrl"
          :alt="activeFile.name"
        />
        <div
          v-else-if="activeFile?.type === 'text' && activeFile.unsupportedBinary"
          class="file-placeholder"
        >
          {{ t('fileView.unsupportedFile', { name: activeFile.name }) }}
        </div>
        <div
          v-else-if="activeFile?.type === 'text'"
          class="text-pane"
          :class="{
            'md-split': markdownPreviewSplit && isMarkdownFile,
            editing: activeFile.isEditing,
          }"
        >
          <div class="editor-split">
            <CodeEditor
              ref="codeEditorRef"
              class="editor-col"
              :model-value="activeFile.textContent"
              :filename="activeFile.name"
              :read-only="!activeFile.isEditing"
              :word-wrap="wordWrap"
              :editor-dark="editorDark"
              @update:model-value="onEditorUpdate"
              @search-open-change="onSearchOpenChange"
            />
            <MarkdownPreview
              v-if="markdownPreviewSplit && isMarkdownFile"
              class="preview-col"
              :source="activeFile.textContent"
            />
          </div>
        </div>
        <div v-else class="file-placeholder">
          {{
            activeFile
              ? t('fileView.emptyFile')
              : t('fileView.openHint')
          }}
        </div>
      </section>
    </div>

    <Toast :message="toastMessage" />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0;
  margin: 0;
}

.main {
  display: flex;
  flex: 1;
  min-height: 0;
}

.sidebar {
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.sidebar:not(.is-collapsed) {
  min-width: 200px;
}

.sidebar.is-collapsed {
  min-width: 40px;
  max-width: 40px;
}

.sidebar-tree-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-collapsed-bar {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 0;
  padding: 8px 0;
  background: var(--color-background);
}

.sidebar-icon-btn {
  width: var(--tree-toolbar-control-size);
  height: var(--tree-toolbar-control-size);
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-text);
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  flex-shrink: 0;
}

.sidebar-icon-btn:hover {
  background: var(--color-border-hover);
}

.sidebar-icon-svg {
  width: 18px;
  height: 18px;
}

.resize-handle {
  flex-shrink: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  transition: background 0.15s;
}

.resize-handle:hover {
  background: var(--color-border);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.text-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-left: 4px solid transparent;
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
}

.text-pane.editing {
  border-left-color: hsla(160, 100%, 37%, 1);
  background: hsla(160, 100%, 37%, 0.08);
  box-shadow: inset 0 0 0 1px hsla(160, 100%, 37%, 0.2);
}

.editor-split {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.text-pane.md-split .editor-split {
  flex-direction: row;
}

.editor-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.preview-col {
  flex: 1;
  min-width: 0;
  min-height: 0;
  border-left: 1px solid var(--color-border);
}

.text-pane.md-split .editor-col,
.text-pane.md-split .preview-col {
  flex: 1;
}

.file-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--color-heading);
  opacity: 0.8;
}
</style>
