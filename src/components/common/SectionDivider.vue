<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="my-4 flex items-center">
    <span class="pr-3 text-sm text-gray-500 dark:text-gray-400">{{ title }}</span>
    <hr class="flex-1 border-t border-gray-200 dark:border-dark-700">
  </div>
</template>
