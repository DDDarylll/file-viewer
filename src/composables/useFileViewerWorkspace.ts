import { ref, computed, readonly, type Ref } from 'vue'
import type { TreeNode } from '@/types/file-system'
import type { OpenedFile } from '@/types/opened-file'
import { isImageFile, isTextFile } from '@/utils/file-type'
import { loadDirectoryChildren } from '@/utils/load-directory-children'
import { useToast } from './useToast'

/** 与 CodeEditor 暴露的实例方法对齐（避免 SFC 循环引用）。 */
export interface CodeEditorInstance {
  toggleSearch: () => void
}

export interface UseFileViewerWorkspaceOptions {
  codeEditorRef: Ref<CodeEditorInstance | null>
}

export function useFileViewerWorkspace(options: UseFileViewerWorkspaceOptions) {
  const { codeEditorRef } = options
  const { message: toastMessage, show: showToast } = useToast()

  const rootNodes = ref<TreeNode[] | null>(null)
  const rootName = ref('')
  const openedFiles = ref<OpenedFile[]>([])
  const activeFileId = ref<number | null>(null)
  const error = ref('')
  const loading = ref(false)
  const wordWrap = ref(true)

  let nextFileId = 0

  const activeFile = computed(
    () => openedFiles.value.find((f) => f.id === activeFileId.value) ?? null,
  )

  function clearOpenedFiles() {
    openedFiles.value.forEach((f) => {
      if (f.imageUrl) URL.revokeObjectURL(f.imageUrl)
    })
    openedFiles.value = []
    activeFileId.value = null
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
      rootNodes.value = await loadDirectoryChildren(handle)
      clearOpenedFiles()
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        error.value = (e as Error).message || '选择失败'
      }
    } finally {
      loading.value = false
    }
  }

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

  return {
    toastMessage,
    // 文件树懒加载会原地改 expanded / children，不能包 readonly（会拦深层赋值且不更新视图）
    rootNodes,
    rootName: readonly(rootName),
    openedFiles: readonly(openedFiles),
    activeFileId: readonly(activeFileId),
    error: readonly(error),
    loading: readonly(loading),
    wordWrap: readonly(wordWrap),
    activeFile,
    selectFolder,
    reloadFile,
    copyPath,
    toggleWordWrap,
    toggleFind,
    downloadImage,
    closeFile,
    canEdit,
    startEdit,
    saveFile,
    cancelEdit,
    onEditorUpdate,
    switchToFile,
    onSelectFile,
  }
}
