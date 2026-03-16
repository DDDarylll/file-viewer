<script setup lang="ts">
import FileTreeItem from './FileTreeItem.vue'
import type { TreeNode } from '@/types/file-system'

const props = defineProps<{
  rootNodes: TreeNode[] | null
}>()

const emit = defineEmits<{
  selectFile: [handle: FileSystemFileHandle, name: string, path: string]
}>()
</script>

<template>
  <div class="file-tree">
    <template v-if="rootNodes?.length">
      <FileTreeItem
        v-for="node in rootNodes"
        :key="node.path"
        :node="node"
        :depth="0"
        @select-file="(h, n, p) => emit('selectFile', h, n, p)"
      />
    </template>
    <div v-else class="empty">
      {{ rootNodes ? '该文件夹为空' : '请选择文件夹' }}
    </div>
  </div>
</template>

<style scoped>
.file-tree {
  overflow-y: auto;
  height: 100%;
}

.empty {
  padding: 16px;
  color: var(--color-text);
  opacity: 0.7;
}
</style>
