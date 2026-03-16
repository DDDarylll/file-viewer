<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNode, DirNode } from '@/types/file-system'

const props = defineProps<{
  node: TreeNode
  depth: number
}>()

const emit = defineEmits<{
  selectFile: [handle: FileSystemFileHandle, name: string, path: string]
}>()

const loading = ref(false)

async function loadChildren(dir: DirNode) {
  if (dir.children !== null) {
    dir.expanded = !dir.expanded
    return
  }
  loading.value = true
  try {
    const children: TreeNode[] = []
    for await (const entry of dir.handle.values()) {
      if (entry.kind === 'directory') {
        children.push({
          name: entry.name,
          path: `${dir.path}/${entry.name}`,
          kind: 'directory',
          handle: entry,
          expanded: false,
          children: null,
        })
      } else {
        children.push({
          name: entry.name,
          path: `${dir.path}/${entry.name}`,
          kind: 'file',
          handle: entry,
        })
      }
    }
    children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    dir.children = children
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
  <div class="tree-node">
    <div
      v-if="node.kind === 'directory'"
      class="tree-item dir"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
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
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
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
