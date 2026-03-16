<script setup lang="ts">
import type { OpenedFile } from '@/types/opened-file'

defineProps<{
  files: OpenedFile[]
  activeFileId: number | null
}>()

defineEmits<{
  switch: [id: number]
  close: [id: number, event?: MouseEvent]
}>()
</script>

<template>
  <div v-if="files.length" class="tabs">
    <button
      v-for="file in files"
      :key="file.id"
      class="tab"
      :class="{ active: file.id === activeFileId }"
      :title="file.path"
      @click="$emit('switch', file.id)"
    >
      <span class="tab-name">{{ file.name }}{{ file.isDirty ? ' *' : '' }}</span>
      <span class="tab-close" @click="$emit('close', file.id, $event)">×</span>
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  background: var(--color-background-mute);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: clip;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  background: transparent;
  border: none;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  color: var(--color-text);
  opacity: 0.8;
}

.tab:hover {
  background: var(--color-border-hover);
  opacity: 1;
}

.tab.active {
  background: var(--color-background);
  opacity: 1;
  border-bottom: 1px solid var(--color-background);
  margin-bottom: -1px;
}

.tab-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  font-size: 16px;
  line-height: 1;
  padding: 0 2px;
  opacity: 0.6;
}

.tab-close:hover {
  opacity: 1;
}
</style>
