<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  columns?: 1 | 2 | 3 | 4
}>(), {
  columns: 3,
})

const gridClass = computed(() => {
  const classes = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return classes[props.columns]
})
</script>

<template>
  <div
    class="grid overflow-hidden rounded-lg border border-gray-200 dark:border-dark-600"
    :class="gridClass"
  >
    <slot />
  </div>
</template>
