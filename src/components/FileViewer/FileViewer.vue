<script setup lang="ts">
import { ref } from 'vue'
import FileTree from '../FileTree/index.vue'
import CodeEditor from '../CodeEditor/index.vue'
import AppHeader from '../AppHeader/index.vue'
import FileTabs from '../FileTabs/index.vue'
import EditorToolbar from '../EditorToolbar/index.vue'
import ImageViewer from '../ImageViewer/index.vue'
import Toast from '../Toast/index.vue'
import { useResizableSidebar } from '@/composables/useResizableSidebar'
import {
  useFileViewerWorkspace,
  type CodeEditorInstance,
} from '@/composables/useFileViewerWorkspace'

const codeEditorRef = ref<CodeEditorInstance | null>(null)

const { width: sidebarWidth, onResizeStart } = useResizableSidebar()

const {
  toastMessage,
  rootNodes,
  rootName,
  openedFiles,
  activeFileId,
  error,
  loading,
  wordWrap,
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
} = useFileViewerWorkspace({ codeEditorRef })
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
