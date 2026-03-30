<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState, type Extension } from '@codemirror/state'
import { StreamLanguage } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { xml } from '@codemirror/lang-xml'
import { python } from '@codemirror/lang-python'
import { cpp } from '@codemirror/lang-cpp'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { markdown } from '@codemirror/lang-markdown'
import { yaml } from '@codemirror/lang-yaml'
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile'
import { groovy } from '@codemirror/legacy-modes/mode/groovy'
import { oneDark } from '@codemirror/theme-one-dark'
import { search, openSearchPanel, closeSearchPanel, searchPanelOpen } from '@codemirror/search'
import { chinesePhrases } from './i18n'

const props = withDefaults(
  defineProps<{
    modelValue: string
    filename: string
    readOnly?: boolean
    wordWrap?: boolean
    /** false 时使用浅色编辑区（与亮色主题搭配） */
    editorDark?: boolean
  }>(),
  { readOnly: false, wordWrap: false, editorDark: true }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null

const LANG_MAP: Record<string, () => Extension> = {
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  json: () => json(),
  xml: () => xml(),
  html: () => html(),
  css: () => css(),
  scss: () => css(),
  less: () => css(),
  python: () => python(),
  c: () => cpp(),
  cpp: () => cpp(),
  markdown: () => markdown(),
  yaml: () => yaml(),
  groovy: () => StreamLanguage.define(groovy),
  dockerfile: () => StreamLanguage.define(dockerFile),
}

function getLanguage(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower === 'dockerfile' || lower.startsWith('dockerfile.')) return 'dockerfile'
  if (lower === 'jenkinsfile' || lower.startsWith('jenkinsfile.')) return 'groovy'
  const ext = filename.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    jsx: 'javascript',
    tsx: 'typescript',
    vue: 'xml',
    htm: 'xml',
    yml: 'yaml',
    md: 'markdown',
    py: 'python',
    h: 'c',
    hpp: 'cpp',
  }
  return (ext && map[ext]) || ext || 'plaintext'
}

function getExtensions(filename: string) {
  const lang = getLanguage(filename)
  const langSupport = LANG_MAP[lang]?.()
  const extensions: Extension[] = [
    basicSetup,
    search(),
    EditorState.phrases.of(chinesePhrases),
    ...(props.editorDark ? [oneDark] : []),
    ...(langSupport ? [langSupport] : []),
    ...(props.wordWrap ? [EditorView.lineWrapping] : []),
  ]
  if (props.readOnly) {
    extensions.push(EditorState.readOnly.of(true))
  } else {
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          emit('update:modelValue', update.state.doc.toString())
        }
      })
    )
  }
  return extensions
}

function createEditor() {
  if (!containerRef.value) return
  view?.destroy()
  const state = EditorState.create({
    doc: props.modelValue,
    extensions: getExtensions(props.filename),
  })
  view = new EditorView({
    state,
    parent: containerRef.value,
  })
}

onMounted(createEditor)

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})

watch(
  () =>
    [props.modelValue, props.filename, props.readOnly, props.wordWrap, props.editorDark] as const,
  (
    [newVal, newFile, newReadOnly, newWrap, newDark],
    [oldVal, oldFile, oldReadOnly, oldWrap, oldDark],
  ) => {
    if (
      view &&
      (newFile !== oldFile ||
        newReadOnly !== oldReadOnly ||
        newWrap !== oldWrap ||
        newDark !== oldDark)
    ) {
      view.destroy()
      createEditor()
    } else if (view && newVal !== oldVal && view.state.doc.toString() !== newVal) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: newVal },
      })
    }
  }
)

function toggleSearch() {
  if (!view) return
  if (searchPanelOpen(view.state)) {
    closeSearchPanel(view)
  } else {
    openSearchPanel(view)
  }
}

defineExpose({ toggleSearch })
</script>

<template>
  <div
    ref="containerRef"
    class="code-editor"
    :class="{ 'cm-light': !editorDark }"
  ></div>
</template>

<style scoped>
.code-editor {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.code-editor :deep(.cm-editor) {
  height: 100%;
  min-height: 200px;
}

.code-editor :deep(.cm-scroller) {
  min-height: 200px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.code-editor.cm-light :deep(.cm-editor) {
  background: var(--color-background);
}

.code-editor.cm-light :deep(.cm-gutters) {
  background: var(--color-background-mute);
  border-right-color: var(--color-border);
}
</style>
