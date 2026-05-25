<template>
  <div
    v-if="show"
    class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-[inherit] bg-white/80 text-sm text-gray-600 backdrop-blur-sm dark:bg-dark-900/70 dark:text-dark-300"
    role="status"
    aria-live="polite"
  >
    <LoadingSpinner
      size="md"
      color="primary"
    />
    <span v-if="text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from './LoadingSpinner.vue'

withDefaults(defineProps<{
  show?: boolean
  text?: string
}>(), {
  show: false,
  text: '加载中...'
})
</script>
