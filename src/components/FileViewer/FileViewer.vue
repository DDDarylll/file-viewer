<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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

const editorDark = computed(() => {
  if (themeMode.value === 'dark') return true
  if (themeMode.value === 'light') return false
  return systemDark.value
})

const themeLabel = computed(() => {
  const labels: Record<ThemeMode, string> = {
    system: '主题：跟随系统',
    light: '主题：浅色',
    dark: '主题：深色',
  }
  return labels[themeMode.value]
})

let mql: MediaQueryList | null = null
function onSystemSchemeChange(e: MediaQueryListEvent) {
  systemDark.value = e.matches
}

onMounted(() => {
  applyThemeToDocument(themeMode.value)
  mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', onSystemSchemeChange)
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', onSystemSchemeChange)
})

function cycleTheme() {
  const order: ThemeMode[] = ['system', 'light', 'dark']
  const i = order.indexOf(themeMode.value)
  const idx = i >= 0 ? (i + 1) % order.length : 0
  const next: ThemeMode = order[idx] ?? 'system'
  themeMode.value = next
  prefs.persistTheme(next)
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
      :theme-label="themeLabel"
      @select-folder="selectFolder"
      @select-single-file="selectSingleFile"
      @cycle-theme="cycleTheme"
    />

    <div class="main">
      <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }">
        <FileTree
          :root-nodes="rootNodes"
          :root-directory-handle="rootDirectoryHandle"
          :root-path-prefix="rootName"
          :highlight-path="activeFile?.path ?? null"
          @select-file="onSelectFile"
        />
      </aside>
      <div class="resize-handle" title="拖拽调整宽度" @mousedown="onResizeStart" />
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
          :can-edit="canEdit"
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
            />
            <MarkdownPreview
              v-if="markdownPreviewSplit && isMarkdownFile"
              class="preview-col"
              :source="activeFile.textContent"
            />
          </div>
        </div>
        <div v-else class="file-placeholder">
          {{ activeFile ? '（空文件）' : '点击左侧文件查看内容，或使用顶部「打开文件」' }}
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
  min-width: 200px;
  border-right: 1px solid var(--color-border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
