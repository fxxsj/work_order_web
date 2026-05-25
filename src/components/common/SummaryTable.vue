<script setup lang="ts">
import type { Column } from './types'

const props = withDefaults(defineProps<{
  columns: Column[]
  data: any[]
  rowKey?: string | ((row: any, index: number) => string | number)
  loading?: boolean
}>(), {
  rowKey: 'id',
  loading: false,
})

const resolveRowKey = (row: any, index: number) => {
  if (typeof props.rowKey === 'function') return props.rowKey(row, index)
  return row?.[props.rowKey] ?? index
}

const alignClass = (align: Column['align'] = 'left') => {
  const classes = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return classes[align]
}

const normalizeSize = (size?: number | string) => {
  if (size === undefined || size === null || size === '') return undefined
  return typeof size === 'number' ? `${size}px` : size
}

const columnStyle = (column: Column) => ({
  width: normalizeSize(column.width),
  minWidth: normalizeSize(column.minWidth),
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse">
      <thead>
        <tr class="text-xs uppercase text-gray-500 dark:text-gray-400">
          <th
            v-for="column in columns"
            :key="column.key"
            class="px-3 py-2 font-medium"
            :class="[alignClass(column.align), column.class]"
            :style="columnStyle(column)"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
        <tr
          v-for="index in 3"
          v-if="loading"
          :key="`loading-${index}`"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-3 py-2"
          >
            <div class="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-dark-700" />
          </td>
        </tr>
        <tr v-else-if="data.length === 0">
          <td
            :colspan="columns.length"
            class="px-3 py-8 text-center text-sm text-gray-500 dark:text-dark-400"
          >
            <slot name="empty">
              暂无数据
            </slot>
          </td>
        </tr>
        <tr
          v-for="(row, index) in data"
          v-else
          :key="resolveRowKey(row, index)"
          class="hover:bg-gray-50 dark:hover:bg-dark-800"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
            :class="[alignClass(column.align), column.className]"
            :style="columnStyle(column)"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row?.[column.key]"
              :index="index"
            >
              {{ column.formatter ? column.formatter(row?.[column.key], row) : row?.[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
