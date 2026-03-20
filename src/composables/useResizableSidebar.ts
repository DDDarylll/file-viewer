import { ref, onBeforeUnmount } from 'vue'

export interface UseResizableSidebarOptions {
  min?: number
  max?: number
  initial?: number
}

export function useResizableSidebar(options: UseResizableSidebarOptions = {}) {
  const { min = 200, max = 480, initial = 280 } = options
  const width = ref(initial)
  let isResizing = false
  let resizeStartX = 0
  let resizeStartWidth = 0

  function onResizeMove(e: MouseEvent) {
    if (!isResizing) return
    const delta = e.clientX - resizeStartX
    width.value = Math.max(min, Math.min(max, resizeStartWidth + delta))
  }

  function onResizeEnd() {
    if (!isResizing) return
    isResizing = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onResizeMove)
    document.removeEventListener('mouseup', onResizeEnd)
  }

  function onResizeStart(e: MouseEvent) {
    isResizing = true
    resizeStartX = e.clientX
    resizeStartWidth = width.value
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onResizeMove)
    document.addEventListener('mouseup', onResizeEnd)
  }

  onBeforeUnmount(onResizeEnd)

  return { width, onResizeStart }
}
