<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
        <Icon
          name="cube"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ stats.total_quantity || 0 }}
        </div><div class="text-xs text-gray-500">
          总库存数
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-gray-100 p-4 dark:bg-dark-700">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500 text-white">
        <Icon
          name="inbox"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ stats.total_products || 0 }}
        </div><div class="text-xs text-gray-500">
          产品种类
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-white">
        <Icon
          name="exclamationTriangle"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ stats.low_stock_count || 0 }}
        </div><div class="text-xs text-gray-500">
          低库存
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
</script>