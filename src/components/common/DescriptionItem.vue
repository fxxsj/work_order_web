<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  span?: 1 | 2 | 3 | 4
}>(), {
  span: 1,
})

const spanClass = computed(() => {
  const classes = {
    1: '',
    2: 'sm:col-span-2',
    3: 'sm:col-span-2 lg:col-span-3',
    4: 'sm:col-span-2 lg:col-span-4',
  }

  return classes[props.span]
})
</script>

<template>
  <div
    class="flex border-b border-r border-gray-200 dark:border-dark-600"
    :class="spanClass"
  >
    <div class="w-[7.5rem] min-w-[7.5rem] shrink-0 border-r border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-dark-600 dark:bg-dark-800 dark:text-dark-400">
      {{ label }}
    </div>
    <div class="min-w-0 flex-1 break-words px-4 py-3 text-sm text-gray-900 dark:text-dark-100">
      <slot />
    </div>
  </div>
</template>
