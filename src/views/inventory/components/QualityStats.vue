<template>
  <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
    <div class="flex items-center gap-3 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white">
        <Icon
          name="document"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ stats.total_count || 0 }}
        </div><div class="text-xs text-gray-500">
          检验总数
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-yellow-50 p-4 dark:bg-yellow-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500 text-white">
        <Icon
          name="clock"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ stats.pending_count || 0 }}
        </div><div class="text-xs text-gray-500">
          待检验
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
          {{ stats.passed_count || 0 }}
        </div><div class="text-xs text-gray-500">
          合格
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white">
        <Icon
          name="xCircle"
          class="h-6 w-6"
        />
      </div><div>
        <div class="text-2xl font-bold">
          {{ stats.failed_count || 0 }}
        </div><div class="text-xs text-gray-500">
          不合格
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
</script>