<script setup lang="ts">
import { computed, ref } from 'vue'
import FileTreeItem from './FileTreeItem.vue'
import type { TreeNode, DirNode } from '@/types/file-system'
import { loadDirectoryChildren } from '@/utils/load-directory-children'
import { nodeVisibleInFilter } from '@/utils/tree-filter'

const props = defineProps<{
  node: TreeNode
  depth: number
  filterQuery: string
  highlightPath: string | null
}>()

const emit = defineEmits<{
  selectFile: [handle: FileSystemFileHandle, name: string, path: string]
}>()

const loading = ref(false)

const visible = computed(() => nodeVisibleInFilter(props.node, props.filterQuery))

const isHighlighted = computed(
  () => props.highlightPath != null && props.node.path === props.highlightPath,
)

async function loadChildren(dir: DirNode) {
  if (dir.children !== null) {
    dir.expanded = !dir.expanded
    return
  }
  loading.value = true
  try {
    dir.children = await loadDirectoryChildren(dir.handle, dir.path)
    dir.expanded = true
  } finally {
    loading.value = false
  }
}

function onFileClick(handle: FileSystemFileHandle, name: string, path: string) {
  emit('selectFile', handle, name, path)
}
</script>

<template>
  <div v-if="visible" class="tree-node">
    <div
      v-if="node.kind === 'directory'"
      class="tree-item dir"
      :class="{ highlighted: isHighlighted }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      :data-tree-path="node.path"
      @click="loadChildren(node)"
    >
      <span class="expand-icon">{{ node.expanded ? '▼' : '▶' }}</span>
      <span class="icon">📁</span>
      <span class="name">{{ node.name }}/</span>
      <span v-if="loading" class="loading">...</span>
    </div>
    <div
      v-else
      class="tree-item file"
      :class="{ highlighted: isHighlighted }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      :data-tree-path="node.path"
      @click="onFileClick(node.handle, node.name, node.path)"
    >
      <span class="expand-icon placeholder"></span>
      <span class="icon">📄</span>
      <span class="name">{{ node.name }}</span>
    </div>
    <template v-if="node.kind === 'directory' && node.expanded && node.children">
      <FileTreeItem
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
        :filter-query="filterQuery"
        :highlight-path="highlightPath"
        @select-file="(h, n, p) => emit('selectFile', h, n, p)"
      />
    </template>
  </div>
</template>

<style scoped>
.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

.tree-item:hover {
  background: var(--color-border-hover);
}

.tree-item.highlighted {
  background: hsla(160, 100%, 37%, 0.2);
  outline: 1px solid hsla(160, 100%, 37%, 0.45);
}

.tree-item.dir {
  font-weight: 500;
}

.tree-item.file {
  font-weight: normal;
}

.expand-icon {
  width: 12px;
  font-size: 10px;
  color: var(--color-text);
}

.expand-icon.placeholder {
  visibility: hidden;
}

.icon {
  font-size: 14px;
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading {
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.7;
}
</style>
