<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import type { OpenedFile } from '@/types/opened-file'

defineProps<{
  files: ReadonlyArray<OpenedFile>
  activeFileId: number | null
}>()

const emit = defineEmits<{
  switch: [id: number]
  close: [id: number, event?: MouseEvent]
  reorder: [fromIndex: number, toIndex: number]
  closeOthers: [id: number]
  closeToRight: [id: number]
  restoreClosed: []
}>()

const dragIndex = ref<number | null>(null)
const menuOpenId = ref<number | null>(null)
const menuX = ref(0)
const menuY = ref(0)
const menuRef = ref<HTMLElement | null>(null)

function onDocCloseMenu(e: MouseEvent) {
  const t = e.target as Node
  if (menuRef.value?.contains(t)) return
  document.removeEventListener('mousedown', onDocCloseMenu, true)
  menuOpenId.value = null
}

watch(menuOpenId, (id) => {
  document.removeEventListener('mousedown', onDocCloseMenu, true)
  if (id != null) {
    requestAnimationFrame(() => {
      document.addEventListener('mousedown', onDocCloseMenu, true)
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocCloseMenu, true)
})

function onDragStart(index: number, e: DragEvent) {
  dragIndex.value = index
  e.dataTransfer?.setData('text/plain', String(index))
  e.dataTransfer!.effectAllowed = 'move'
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
}

function onDrop(targetIndex: number, e: DragEvent) {
  e.preventDefault()
  const from = dragIndex.value
  dragIndex.value = null
  if (from == null) return
  emit('reorder', from, targetIndex)
}

function onDragEnd() {
  dragIndex.value = null
}

function openMenu(id: number, e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  if (menuOpenId.value === id) {
    menuOpenId.value = null
    return
  }
  menuOpenId.value = id
  menuX.value = e.clientX
  menuY.value = e.clientY
}

function closeMenu() {
  document.removeEventListener('mousedown', onDocCloseMenu, true)
  menuOpenId.value = null
}

function onCloseOthers(id: number) {
  closeMenu()
  emit('closeOthers', id)
}

function onCloseToRight(id: number) {
  closeMenu()
  emit('closeToRight', id)
}

function onRestoreClosed() {
  closeMenu()
  emit('restoreClosed')
}
</script>

<template>
  <div v-if="files.length" class="tabs-wrap" @click.self="closeMenu">
    <div class="tabs">
      <button
        v-for="(file, index) in files"
        :key="file.id"
        class="tab"
        :class="{ active: file.id === activeFileId, dragging: dragIndex === index }"
        draggable="true"
        :title="file.path"
        @click="$emit('switch', file.id)"
        @dragstart="onDragStart(index, $event)"
        @dragover="onDragOver"
        @drop="onDrop(index, $event)"
        @dragend="onDragEnd"
        @contextmenu="openMenu(file.id, $event)"
      >
        <span class="tab-name">{{ file.name }}{{ file.isDirty ? ' *' : '' }}</span>
        <span class="tab-close" @click="$emit('close', file.id, $event)">×</span>
      </button>
    </div>
    <Teleport to="body">
      <div
        v-if="menuOpenId != null"
        ref="menuRef"
        class="tab-menu"
        :style="{ left: menuX + 'px', top: menuY + 'px' }"
        @mousedown.stop
      >
        <button type="button" class="menu-row" @click="onCloseOthers(menuOpenId!)">关闭其他</button>
        <button type="button" class="menu-row" @click="onCloseToRight(menuOpenId!)">关闭右侧</button>
        <button type="button" class="menu-row" @click="onRestoreClosed">恢复最近关闭</button>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.tabs-wrap {
  position: relative;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  gap: 2px;
  padding: 8px 8px 0;
  background: var(--color-background-mute);
  border-bottom: 1px solid var(--color-border);
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

.tab.dragging {
  opacity: 0.45;
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

.tab-menu {
  position: fixed;
  z-index: 100;
  min-width: 160px;
  padding: 4px 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.menu-row {
  display: block;
  width: 100%;
  padding: 8px 14px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  background: transparent;
  color: var(--color-text);
  border: none;
}

.menu-row:hover {
  background: var(--color-border-hover);
}
</style>
