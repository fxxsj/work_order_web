<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <Icon
            name="document"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            发票总数
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(stats.total_count) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            当前筛选范围
          </p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
          <Icon
            name="edit"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            待开具
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(stats.draft_count) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            草稿发票
          </p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <Icon
            name="checkCircle"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            开票金额
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCurrency(stats.total_amount) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            价税合计
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
            待收款
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCurrency(stats.pending_amount) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            未收金额
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

const formatCurrency = (value: any) => {
  const amount = Number(value || 0)
  return `¥${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>
