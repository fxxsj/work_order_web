<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    <div class="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
        <Icon
          name="list"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ summary.total_count || 0 }}
        </div><div class="text-xs text-gray-500">
          总发货单
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-gray-100 p-4 dark:bg-dark-700">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500 text-white">
        <Icon
          name="clock"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ summary.pending_count || 0 }}
        </div><div class="text-xs text-gray-500">
          待发货
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-white">
        <Icon
          name="truck"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ (summary.shipped_count || 0) + (summary.in_transit_count || 0) }}
        </div><div class="text-xs text-gray-500">
          运输中
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500 text-white">
        <Icon
          name="checkCircle"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ summary.received_count || 0 }}
        </div><div class="text-xs text-gray-500">
          已完成
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
const summary = computed(() => props.stats?.summary || props.stats || {})
</script>
