<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <Icon
            name="list"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            总发货单
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(summary.total_count) }}
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
            name="clock"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            待发货
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(summary.pending_count) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            待处理发货单
          </p>
        </div>
      </div>
    </div>

    <div class="card p-4">
      <div class="flex items-center gap-3">
        <div class="rounded-lg bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          <Icon
            name="truck"
            size="md"
          />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            运输中
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(inTransitCount) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            已发货未完成
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
            已完成
          </p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">
            {{ loading ? '-' : formatCount(summary.received_count) }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            已签收发货单
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const summary = computed(() => props.stats?.summary || props.stats || {})
const inTransitCount = computed(() => Number(summary.value.shipped_count || 0) + Number(summary.value.in_transit_count || 0))
const formatCount = (value: any) => Number(value || 0).toLocaleString()
</script>
