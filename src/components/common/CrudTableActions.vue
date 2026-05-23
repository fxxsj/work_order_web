<template>
  <div class="flex items-center justify-center gap-2">
    <button
      v-if="showView"
      class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
      @click="emit('view')"
    >
      查看
    </button>
    <button
      v-if="showEdit"
      class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
      @click="emit('edit')"
    >
      编辑
    </button>
    <button
      v-if="showDelete"
      class="btn btn-ghost btn-sm text-danger-600 dark:text-danger-400"
      @click="emit('delete')"
    >
      删除
    </button>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  showView: { type: Boolean, default: true },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true }
})

const emit = defineEmits(['view', 'edit', 'delete'])
</script>
