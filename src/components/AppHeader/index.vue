<script setup lang="ts">
defineProps<{
  loading: boolean
  rootName: string
  error: string
}>()

defineEmits<{
  selectFolder: []
}>()
</script>

<template>
  <header class="header">
    <button class="btn" :disabled="loading" @click="$emit('selectFolder')">
      {{ loading ? '加载中...' : '选择文件夹' }}
    </button>
    <span v-if="rootName" class="root-name">{{ rootName }}</span>
    <span v-if="error" class="error">{{ error }}</span>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
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

.btn:hover:not(:disabled) {
  background: hsla(160, 100%, 32%, 1);
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
