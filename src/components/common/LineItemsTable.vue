<script setup lang="ts">
import type { Column } from './types'

const props = withDefaults(defineProps<{
  columns: Column[]
  items: any[]
  emptyText?: string
  showDelete?: boolean
  deleteDisabled?: (item: any, index: number) => boolean
}>(), {
  emptyText: '暂无明细数据',
  showDelete: true,
})

const emit = defineEmits<{
  (e: 'delete', index: number): void
}>()

const alignClass = (align?: Column['align']) => {
  const classes = { left: 'text-left', center: 'text-center', right: 'text-right' }
  return align ? classes[align] : 'text-left'
}

const normalizeSize = (size?: number | string) => {
  if (size === undefined || size === null || size === '') return undefined
  return typeof size === 'number' ? `${size}px` : size
}

const columnStyle = (column: Column) => ({
  width: normalizeSize(column.width),
  minWidth: normalizeSize(column.minWidth),
})

const handleDelete = (index: number) => {
  emit('delete', index)
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead>
        <tr class="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-3 py-2"
            :class="[alignClass(column.align), column.class]"
            :style="columnStyle(column)"
          >
            {{ column.label }}
          </th>
          <th v-if="showDelete" class="w-20 px-3 py-2 text-center">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="items.length === 0">
          <td :colspan="columns.length + (showDelete ? 1 : 0)" class="px-3 py-8 text-center text-sm text-gray-500 dark:text-dark-400">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
        <tr
          v-for="(item, index) in items"
          :key="index"
          class="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-3 py-2"
            :class="[alignClass(column.align), column.class]"
            :style="columnStyle(column)"
          >
            <slot :name="`cell-${column.key}`" :row="item" :index="index" :value="item[column.key]">
              {{ item[column.key] }}
            </slot>
          </td>
          <td v-if="showDelete" class="px-3 py-2 text-center">
            <button
              class="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed dark:text-red-400 dark:hover:bg-red-900/20"
              :disabled="deleteDisabled?.(item, index)"
              @click="handleDelete(index)"
            >
              <slot name="delete-icon">删除</slot>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
