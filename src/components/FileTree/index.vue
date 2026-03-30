<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import FileTreeItem from './FileTreeItem.vue'
import type { TreeNode } from '@/types/file-system'
import { searchFilesByName } from '@/utils/search-files'

const props = defineProps<{
  rootNodes: TreeNode[] | null
  rootDirectoryHandle: FileSystemDirectoryHandle | null
  rootPathPrefix: string
  highlightPath: string | null
}>()

const emit = defineEmits<{
  selectFile: [handle: FileSystemFileHandle, name: string, path: string]
}>()

const filterInput = ref('')
const debouncedQuery = ref('')
const searchHits = ref<{ handle: FileSystemFileHandle; name: string; path: string }[]>([])
const searchLoading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let searchAbort: AbortController | null = null

watch(
  () => filterInput.value,
  (v) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      debouncedQuery.value = v
    }, 280)
  },
)

watch(
  () => [debouncedQuery.value, props.rootDirectoryHandle, props.rootPathPrefix] as const,
  async ([q, rootHandle, prefix]) => {
    searchAbort?.abort()
    const query = q.trim()
    if (!query || !rootHandle || !prefix) {
      searchHits.value = []
      searchLoading.value = false
      return
    }
    searchAbort = new AbortController()
    const signal = searchAbort.signal
    searchLoading.value = true
    try {
      searchHits.value = await searchFilesByName(rootHandle, prefix, query, {
        maxResults: 150,
        signal,
      })
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        searchHits.value = []
      }
    } finally {
      if (!signal.aborted) searchLoading.value = false
    }
  },
)

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  searchAbort?.abort()
})

function onHitClick(hit: { handle: FileSystemFileHandle; name: string; path: string }) {
  emit('selectFile', hit.handle, hit.name, hit.path)
}
</script>

<template>
  <div class="file-tree-wrap">
    <div class="tree-toolbar">
      <input
        v-model="filterInput"
        class="filter-input"
        type="search"
        placeholder="过滤 / 搜索文件名…"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <div v-if="debouncedQuery.trim() && rootDirectoryHandle" class="search-panel">
      <div class="search-panel-head">
        仓库内匹配
        <span v-if="searchLoading" class="search-loading">搜索中…</span>
        <span v-else class="search-count">（{{ searchHits.length }}）</span>
      </div>
      <ul v-if="searchHits.length" class="search-list">
        <li
          v-for="hit in searchHits"
          :key="hit.path"
          class="search-hit"
          :title="hit.path"
          @click="onHitClick(hit)"
        >
          {{ hit.path }}
        </li>
      </ul>
      <div v-else-if="!searchLoading" class="search-empty">无匹配文件</div>
    </div>
    <div class="file-tree">
      <template v-if="rootNodes?.length">
        <FileTreeItem
          v-for="node in rootNodes"
          :key="node.path"
          :node="node"
          :depth="0"
          :filter-query="debouncedQuery"
          :highlight-path="highlightPath"
          @select-file="(h, n, p) => emit('selectFile', h, n, p)"
        />
      </template>
      <div v-else class="empty">
        {{ rootNodes ? '该文件夹为空' : '请选择文件夹或打开单个文件' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-tree-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.tree-toolbar {
  flex-shrink: 0;
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.filter-input {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  font-size: 13px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.filter-input::placeholder {
  color: var(--color-text);
  opacity: 0.45;
}

.search-panel {
  flex-shrink: 0;
  max-height: 140px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-mute);
}

.search-panel-head {
  padding: 6px 10px;
  font-size: 12px;
  color: var(--color-text);
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-count,
.search-loading {
  opacity: 0.7;
}

.search-list {
  list-style: none;
  margin: 0;
  padding: 0 4px 6px;
  overflow-y: auto;
  max-height: 110px;
}

.search-hit {
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-hit:hover {
  background: var(--color-border-hover);
}

.search-empty {
  padding: 0 10px 8px;
  font-size: 12px;
  opacity: 0.6;
}

.file-tree {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.empty {
  padding: 16px;
  color: var(--color-text);
  opacity: 0.7;
}
</style>
