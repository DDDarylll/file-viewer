<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { OpenedFile } from '@/types/opened-file'

defineProps<{
  file: OpenedFile | null
  wordWrap: boolean
  findPanelOpen?: boolean
  canEdit: (file: OpenedFile) => boolean
  unsupportedBinary?: boolean
  isMarkdownFile?: boolean
  markdownPreviewSplit?: boolean
}>()

const { t } = useI18n()

defineEmits<{
  startEdit: []
  saveFile: []
  cancelEdit: []
  reloadFile: []
  copyPath: []
  toggleWordWrap: []
  toggleFind: []
  toggleMarkdownPreview: []
  downloadImage: []
}>()
</script>

<template>
  <div v-if="file" class="editor-toolbar">
    <template v-if="file.type === 'text'">
      <div class="toolbar-left">
        <template v-if="canEdit(file)">
          <button
            v-if="!file.isEditing"
            class="toolbar-icon-btn"
            :title="t('toolbar.edit')"
            :aria-label="t('toolbar.edit')"
            @click="$emit('startEdit')"
          >
            <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.862 4.487a2.1 2.1 0 112.97 2.97L9 18.29l-4.5 1.21 1.21-4.5L16.862 4.487z"
              />
            </svg>
          </button>
          <template v-else>
            <button
              class="toolbar-icon-btn primary"
              :title="t('toolbar.save')"
              :aria-label="t('toolbar.save')"
              @click="$emit('saveFile')"
            >
              <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M5.25 4.5h13.5A1.5 1.5 0 0120.25 6v12a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5zm2.25 0V9h9V4.5m-9 10.5h9"
                />
              </svg>
            </button>
            <button
              class="toolbar-icon-btn"
              :title="t('toolbar.cancel')"
              :aria-label="t('toolbar.cancel')"
              @click="$emit('cancelEdit')"
            >
              <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.75 6.75l10.5 10.5m0-10.5l-10.5 10.5"
                />
              </svg>
            </button>
          </template>
        </template>
        <button
          v-if="!unsupportedBinary"
          class="toolbar-icon-btn"
          @click="$emit('reloadFile')"
          :title="t('toolbar.reloadTitle')"
          :aria-label="t('toolbar.reload')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 10.5a7.5 7.5 0 10.588 3m-.588-3V5.25m0 5.25h-5.25"
            />
          </svg>
        </button>
        <button
          class="toolbar-icon-btn"
          @click="$emit('copyPath')"
          :title="t('toolbar.copyPathTitle')"
          :aria-label="t('toolbar.copyPath')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 8.25h9a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0118 20.25H9a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 019 8.25zm-3-4.5h9a1.5 1.5 0 011.5 1.5"
            />
          </svg>
        </button>
      </div>
      <div v-if="canEdit(file) && !unsupportedBinary" class="toolbar-right">
        <button
          class="toolbar-icon-btn"
          :class="{ active: wordWrap }"
          @click="$emit('toggleWordWrap')"
          :title="t('toolbar.wordWrapTitle')"
          :aria-label="t('toolbar.wordWrap')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.5 7.5h15m-15 4.5h9.75a2.25 2.25 0 010 4.5h-2.25m0 0l1.875-1.875M12 16.5l1.875 1.875M4.5 16.5h3"
            />
          </svg>
        </button>
        <button
          class="toolbar-icon-btn"
          :class="{ active: findPanelOpen }"
          @click="$emit('toggleFind')"
          :title="t('toolbar.findTitle')"
          :aria-label="t('toolbar.find')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.25 4.5a6.75 6.75 0 105.303 10.928l2.76 2.76a.75.75 0 101.06-1.06l-2.76-2.76A6.75 6.75 0 0011.25 4.5z"
            />
          </svg>
        </button>
        <button
          v-if="isMarkdownFile"
          type="button"
          class="toolbar-icon-btn"
          :class="{ active: markdownPreviewSplit }"
          :title="t('toolbar.mdPreviewTitle')"
          :aria-label="t('toolbar.mdPreview')"
          @click="$emit('toggleMarkdownPreview')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4.5 4.5h15v15h-15v-15zm7.5 0v15"
            />
          </svg>
        </button>
      </div>
    </template>
    <template v-else-if="file.type === 'image'">
      <div class="toolbar-left">
        <button
          class="toolbar-icon-btn"
          @click="$emit('copyPath')"
          :title="t('toolbar.copyPathTitle')"
          :aria-label="t('toolbar.copyPath')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 8.25h9a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0118 20.25H9a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 019 8.25zm-3-4.5h9a1.5 1.5 0 011.5 1.5"
            />
          </svg>
        </button>
        <button
          class="toolbar-icon-btn"
          @click="$emit('downloadImage')"
          :title="t('toolbar.downloadTitle')"
          :aria-label="t('toolbar.download')"
        >
          <svg class="toolbar-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v10.5m0 0l-3.75-3.75M12 15l3.75-3.75M4.5 18.75h15"
            />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-icon-btn {
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.toolbar-icon-btn:hover {
  background: var(--color-border-hover);
}

.toolbar-icon-btn.active {
  background: hsla(160, 100%, 37%, 0.15);
  border: 1px solid hsla(160, 100%, 37%, 0.5);
  color: hsla(160, 100%, 30%, 1);
}

.toolbar-icon-btn.active:hover {
  background: hsla(160, 100%, 37%, 0.22);
  border-color: hsla(160, 100%, 37%, 0.6);
}

@media (prefers-color-scheme: dark) {
  .toolbar-icon-btn.active {
    background: hsla(160, 100%, 37%, 0.25);
    border-color: hsla(160, 100%, 50%, 0.6);
    color: hsl(160, 70%, 55%);
  }

  .toolbar-icon-btn.active:hover {
    background: hsla(160, 100%, 37%, 0.35);
    border-color: hsla(160, 100%, 50%, 0.7);
  }
}

.toolbar-icon-btn.primary {
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border-color: transparent;
}

.toolbar-icon-btn.primary:hover {
  background: hsla(160, 100%, 32%, 1);
}

.toolbar-icon-svg {
  width: 18px;
  height: 18px;
}
</style>
