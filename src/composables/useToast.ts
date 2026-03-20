import { ref, readonly, onBeforeUnmount } from 'vue'

export function useToast(durationMs = 2000) {
  const message = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  function show(msg: string) {
    message.value = msg
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      message.value = ''
      timer = null
    }, durationMs)
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { message: readonly(message), show }
}
