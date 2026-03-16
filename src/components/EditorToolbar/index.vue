<script setup lang="ts">
import type { OpenedFile } from '@/types/opened-file'

defineProps<{
  file: OpenedFile | null
  wordWrap: boolean
  canEdit: (file: OpenedFile) => boolean
}>()

defineEmits<{
  startEdit: []
  saveFile: []
  cancelEdit: []
  reloadFile: []
  copyPath: []
  toggleWordWrap: []
  toggleFind: []
  downloadImage: []
}>()
</script>

<template>
  <div v-if="file" class="editor-toolbar">
    <template v-if="file.type === 'text'">
      <div class="toolbar-left">
        <template v-if="canEdit(file)">
          <button
            v-if="!file.isEditing"
            class="toolbar-btn"
            @click="$emit('startEdit')"
          >
            编辑
          </button>
          <template v-else>
            <button class="toolbar-btn primary" @click="$emit('saveFile')">保存</button>
            <button class="toolbar-btn" @click="$emit('cancelEdit')">取消</button>
          </template>
        </template>
        <button class="toolbar-btn" @click="$emit('reloadFile')" title="从磁盘重新加载">重新加载</button>
        <button class="toolbar-btn" @click="$emit('copyPath')" title="复制文件路径">复制路径</button>
      </div>
      <div v-if="canEdit(file)" class="toolbar-right">
        <button
          class="toolbar-btn"
          :class="{ active: wordWrap }"
          @click="$emit('toggleWordWrap')"
          title="切换自动换行"
        >
          自动换行
        </button>
        <button class="toolbar-btn" @click="$emit('toggleFind')" title="查找 (Ctrl+F)">
          查找
        </button>
      </div>
    </template>
    <template v-else-if="file.type === 'image'">
      <div class="toolbar-left">
        <button class="toolbar-btn" @click="$emit('copyPath')" title="复制文件路径">复制路径</button>
        <button class="toolbar-btn" @click="$emit('downloadImage')" title="下载图片">下载</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.toolbar-btn:hover {
  background: var(--color-border-hover);
}

.toolbar-btn.active {
  background: hsla(160, 100%, 37%, 0.15);
  border: 1px solid hsla(160, 100%, 37%, 0.5);
  color: hsla(160, 100%, 30%, 1);
}

.toolbar-btn.active:hover {
  background: hsla(160, 100%, 37%, 0.22);
  border-color: hsla(160, 100%, 37%, 0.6);
}

@media (prefers-color-scheme: dark) {
  .toolbar-btn.active {
    background: hsla(160, 100%, 37%, 0.25);
    border-color: hsla(160, 100%, 50%, 0.6);
    color: hsl(160, 70%, 55%);
  }

  .toolbar-btn.active:hover {
    background: hsla(160, 100%, 37%, 0.35);
    border-color: hsla(160, 100%, 50%, 0.7);
  }
}

.toolbar-btn.primary {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: transparent;
}

.toolbar-btn.primary:hover {
  background: hsla(160, 100%, 32%, 1);
}
</style>
