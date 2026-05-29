<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <Icon
            name="cube"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            总库存数
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(stats.total_quantity) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            当前筛选范围
          </p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-sky-100 p-2 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
          <Icon
            name="inbox"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            产品种类
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(stats.total_products) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            涉及产品数
          </p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Icon
            name="exclamationTriangle"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            低库存
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(stats.low_stock_count) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            需补货批次
          </p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
          <Icon
            name="clock"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            过期库存
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(stats.expired_count) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            已过期批次
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const formatCount = (value: any) => Number(value || 0).toLocaleString()
</script>
