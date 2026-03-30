<script setup lang="ts">
defineProps<{
  loading: boolean
  rootName: string
  error: string
  themeLabel: string
}>()

defineEmits<{
  selectFolder: []
  selectSingleFile: []
  cycleTheme: []
}>()
</script>

<template>
  <header class="header">
    <div class="actions">
      <button class="btn" :disabled="loading" @click="$emit('selectFolder')">
        {{ loading ? '加载中...' : '选择文件夹' }}
      </button>
      <button class="btn secondary" :disabled="loading" @click="$emit('selectSingleFile')">
        打开文件
      </button>
      <button type="button" class="btn ghost" :title="themeLabel" @click="$emit('cycleTheme')">
        {{ themeLabel }}
      </button>
    </div>
    <span v-if="rootName" class="root-name">{{ rootName }}</span>
    <span v-if="error" class="error">{{ error }}</span>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  background: hsla(160, 100%, 37%, 1);
  color: white;
  border: none;
  border-radius: 4px;
}

.btn.secondary {
  background: var(--color-background-mute);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn.ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn:hover:not(:disabled) {
  filter: brightness(0.95);
}

.btn.secondary:hover:not(:disabled),
.btn.ghost:hover:not(:disabled) {
  background: var(--color-border-hover);
  filter: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.root-name {
  font-size: 14px;
  color: var(--color-text);
  opacity: 0.8;
}

.error {
  color: #e74c3c;
  font-size: 14px;
}
</style>
