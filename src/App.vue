<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import FileTree from './components/FileTree/index.vue'
import CodeEditor from './components/CodeEditor/index.vue'
import AppHeader from './components/AppHeader/index.vue'
import FileTabs from './components/FileTabs/index.vue'
import EditorToolbar from './components/EditorToolbar/index.vue'
import ImageViewer from './components/ImageViewer/index.vue'
import Toast from './components/Toast/index.vue'
import type { TreeNode } from '@/types/file-system'
import type { OpenedFile } from '@/types/opened-file'
import { isImageFile, isTextFile } from '@/utils/file-type'

const rootNodes = ref<TreeNode[] | null>(null)
const rootName = ref('')
const openedFiles = ref<OpenedFile[]>([])
const activeFileId = ref<number | null>(null)
const error = ref('')
const loading = ref(false)
const sidebarWidth = ref(280)
const wordWrap = ref(true)
const toastMessage = ref('')

const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 480
let nextFileId = 0
let isResizing = false
let resizeStartX = 0
let resizeStartWidth = 0

function onResizeStart(e: MouseEvent) {
  isResizing = true
  resizeStartX = e.clientX
  resizeStartWidth = sidebarWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e: MouseEvent) {
  if (!isResizing) return
  const delta = e.clientX - resizeStartX
  const w = Math.max(SIDEBAR_MIN, Math.min(SIDEBAR_MAX, resizeStartWidth + delta))
  sidebarWidth.value = w
}

function onResizeEnd() {
  isResizing = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

async function loadRootDir(handle: FileSystemDirectoryHandle) {
  const children: TreeNode[] = []
  for await (const entry of handle.values()) {
    const path = `${handle.name}/${entry.name}`
    if (entry.kind === 'directory') {
      children.push({
        name: entry.name,
        path,
        kind: 'directory',
        handle: entry,
        expanded: false,
        children: null,
      })
    } else {
      children.push({
        name: entry.name,
        path,
        kind: 'file',
        handle: entry,
      })
    }
  }
  children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return children
}

async function selectFolder() {
  if (!('showDirectoryPicker' in window)) {
    error.value = '当前浏览器不支持文件夹选择，请使用 Chrome 或 Edge'
    return
  }
  error.value = ''
  loading.value = true
  try {
    const handle = await (
      window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }
    ).showDirectoryPicker()
    rootName.value = handle.name
    rootNodes.value = await loadRootDir(handle)
    clearOpenedFiles()
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      error.value = (e as Error).message || '选择失败'
    }
  } finally {
    loading.value = false
  }
}

const activeFile = computed(
  () => openedFiles.value.find((f) => f.id === activeFileId.value) ?? null,
)
const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
    toastTimer = null
  }, 2000)
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

async function reloadFile() {
  const file = activeFile.value
  if (!file) return
  if (file.isDirty && !confirm('有未保存的修改，重新加载将丢失。是否继续？')) return

  error.value = ''
  loading.value = true
  try {
    const f = await file.handle.getFile()
    if (file.type === 'text') {
      file.textContent = await f.text()
      file.originalContent = file.textContent
      file.isDirty = false
      file.isEditing = false
    } else if (file.type === 'image' && file.imageUrl) {
      URL.revokeObjectURL(file.imageUrl)
      file.imageUrl = URL.createObjectURL(f)
    }
    showToast('已重新加载')
  } catch (e) {
    error.value = (e as Error).message || '重新加载失败'
  } finally {
    loading.value = false
  }
}

async function copyPath() {
  const file = activeFile.value
  if (!file) return
  try {
    await navigator.clipboard.writeText(file.path)
    showToast('已复制路径')
  } catch {
    error.value = '复制失败'
  }
}

function toggleWordWrap() {
  wordWrap.value = !wordWrap.value
}

function toggleFind() {
  codeEditorRef.value?.toggleSearch()
}

async function downloadImage() {
  const file = activeFile.value
  if (!file || file.type !== 'image' || !file.imageUrl) return
  try {
    const a = document.createElement('a')
    a.href = file.imageUrl
    a.download = file.name
    a.click()
  } catch {
    error.value = '下载失败'
  }
}

function clearOpenedFiles() {
  openedFiles.value.forEach((f) => {
    if (f.imageUrl) URL.revokeObjectURL(f.imageUrl)
  })
  openedFiles.value = []
  activeFileId.value = null
}

async function closeFile(id: number, e?: MouseEvent) {
  e?.stopPropagation()
  const idx = openedFiles.value.findIndex((f) => f.id === id)
  const file = openedFiles.value[idx]
  if (idx < 0 || !file) return

  if (file.isDirty) {
    if (!confirm(`${file.name} 有未保存的修改，是否保存？`)) return
    if (activeFileId.value !== id) activeFileId.value = id
    await saveFile()
  }
  if (file.imageUrl) URL.revokeObjectURL(file.imageUrl)

  openedFiles.value = openedFiles.value.filter((f) => f.id !== id)
  if (activeFileId.value === id) {
    const remaining = openedFiles.value
    activeFileId.value = remaining[idx]?.id ?? remaining[idx - 1]?.id ?? null
  }
}

function canEdit(file: OpenedFile): boolean {
  return file.type === 'text' && !file.textContent.startsWith('[无法预览]')
}

function startEdit() {
  const file = activeFile.value
  if (!file || !canEdit(file)) return
  file.originalContent = file.textContent
  file.isEditing = true
}

async function saveFile() {
  const file = activeFile.value
  if (!file || !canEdit(file)) return
  error.value = ''
  try {
    const writable = await file.handle.createWritable()
    await writable.write(file.textContent)
    await writable.close()
    file.isDirty = false
    file.originalContent = file.textContent
    file.isEditing = false
  } catch (e) {
    error.value = (e as Error).message || '保存失败'
  }
}

function cancelEdit() {
  const file = activeFile.value
  if (!file || !file.isEditing) return
  if (file.isDirty && !confirm('放弃未保存的修改？')) return
  file.textContent = file.originalContent
  file.isDirty = false
  file.isEditing = false
}

function onEditorUpdate(value: string) {
  const file = activeFile.value
  if (!file) return
  file.textContent = value
  file.isDirty = value !== file.originalContent
}

async function switchToFile(id: number) {
  if (id === activeFileId.value) return
  const file = openedFiles.value.find((f) => f.id === activeFileId.value)
  if (file?.isDirty) {
    if (!confirm('当前文件有未保存的修改，是否保存？')) return
    await saveFile()
  }
  activeFileId.value = id
}

async function onSelectFile(handle: FileSystemFileHandle, name: string, path: string) {
  error.value = ''

  const existing = openedFiles.value.find((f) => f.handle === handle)
  if (existing) {
    activeFileId.value = existing.id
    return
  }

  if (!isTextFile(name) && !isImageFile(name)) {
    const id = nextFileId++
    const textContent = `[无法预览] ${name}`
    const item: OpenedFile = {
      id,
      name,
      path,
      type: 'text',
      textContent,
      imageUrl: null,
      handle,
      isEditing: false,
      isDirty: false,
      originalContent: textContent,
    }
    openedFiles.value = [...openedFiles.value, item]
    activeFileId.value = id
    return
  }

  loading.value = true
  const id = nextFileId++
  try {
    const file = await handle.getFile()
    if (isImageFile(name)) {
      const item: OpenedFile = {
        id,
        name,
        path,
        type: 'image',
        textContent: '',
        imageUrl: URL.createObjectURL(file),
        handle,
        isEditing: false,
        isDirty: false,
        originalContent: '',
      }
      openedFiles.value = [...openedFiles.value, item]
      activeFileId.value = id
    } else {
      const textContent = await file.text()
      const item: OpenedFile = {
        id,
        name,
        path,
        type: 'text',
        textContent,
        imageUrl: null,
        handle,
        isEditing: false,
        isDirty: false,
        originalContent: textContent,
      }
      openedFiles.value = [...openedFiles.value, item]
      activeFileId.value = id
    }
  } catch (e) {
    error.value = (e as Error).message || '读取失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app">
    <AppHeader
      :loading="loading"
      :root-name="rootName"
      :error="error"
      @select-folder="selectFolder"
    />

    <div class="main">
      <aside class="sidebar" :style="{ width: sidebarWidth + 'px' }">
        <FileTree :root-nodes="rootNodes" @select-file="onSelectFile" />
      </aside>
      <div class="resize-handle" title="拖拽调整宽度" @mousedown="onResizeStart" />
      <section class="content">
        <FileTabs
          :files="openedFiles"
          :active-file-id="activeFileId"
          @switch="switchToFile"
          @close="closeFile"
        />
        <EditorToolbar
          :file="activeFile"
          :word-wrap="wordWrap"
          :can-edit="canEdit"
          @start-edit="startEdit"
          @save-file="saveFile"
          @cancel-edit="cancelEdit"
          @reload-file="reloadFile"
          @copy-path="copyPath"
          @toggle-word-wrap="toggleWordWrap"
          @toggle-find="toggleFind"
          @download-image="downloadImage"
        />
        <ImageViewer
          v-if="activeFile?.type === 'image' && activeFile.imageUrl"
          :src="activeFile.imageUrl"
          :alt="activeFile.name"
        />
        <div
          v-else-if="activeFile?.type === 'text'"
          class="editor-wrapper"
          :class="{ editing: activeFile.isEditing }"
        >
          <CodeEditor
            ref="codeEditorRef"
            :model-value="activeFile.textContent"
            :filename="activeFile.name"
            :read-only="!activeFile.isEditing"
            :word-wrap="wordWrap"
            @update:model-value="onEditorUpdate"
          />
        </div>
        <div v-else class="file-placeholder">
          {{ activeFile ? '（空文件）' : '点击左侧文件查看内容' }}
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
}

.editor-wrapper {
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

.editor-wrapper.editing {
  border-left-color: hsla(160, 100%, 37%, 1);
  background: hsla(160, 100%, 37%, 0.08);
  box-shadow: inset 0 0 0 1px hsla(160, 100%, 37%, 0.2);
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
