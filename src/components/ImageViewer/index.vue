<script setup lang="ts">
defineProps<{
  src: string
  alt: string
}>()
</script>

<template>
  <div class="image-viewer">
    <img :src="src" :alt="alt" />
  </div>
</template>

<style scoped>
.image-viewer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: auto;
  background: var(--color-background-mute);
}

.image-viewer img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
