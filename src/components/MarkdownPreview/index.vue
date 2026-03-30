<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  source: string
}>()

const html = computed(() => {
  try {
    const raw = marked.parse(props.source, { async: false }) as string
    return DOMPurify.sanitize(raw)
  } catch {
    return ''
  }
})
</script>

<template>
  <div class="md-preview" v-html="html" />
</template>

<style scoped>
.md-preview {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 16px 20px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text);
}

.md-preview :deep(h1),
.md-preview :deep(h2),
.md-preview :deep(h3) {
  margin-top: 1.2em;
  margin-bottom: 0.5em;
  color: var(--color-heading);
}

.md-preview :deep(p) {
  margin: 0.6em 0;
}

.md-preview :deep(code) {
  padding: 0.15em 0.4em;
  border-radius: 4px;
  background: var(--color-background-mute);
  font-family: Consolas, Monaco, monospace;
  font-size: 0.9em;
}

.md-preview :deep(pre) {
  padding: 12px 14px;
  border-radius: 6px;
  overflow: auto;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
}

.md-preview :deep(pre code) {
  padding: 0;
  background: none;
}

.md-preview :deep(a) {
  color: hsla(160, 100%, 32%, 1);
}

.md-preview :deep(ul),
.md-preview :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.md-preview :deep(blockquote) {
  margin: 0.8em 0;
  padding-left: 12px;
  border-left: 3px solid var(--color-border);
  opacity: 0.9;
}
</style>
