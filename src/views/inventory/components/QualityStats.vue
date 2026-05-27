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
          {{ summary.total_count || 0 }}
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
          {{ summary.pending_count || 0 }}
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
          {{ passedCount }}
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
          {{ failedCount }}
        </div><div class="text-xs text-gray-500">
          不合格
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
const byResult = computed(() => props.stats?.by_result || [])
const resultCount = (result: string) => byResult.value.find((row: any) => row.result === result)?.count || 0
const passedCount = computed(() => resultCount('passed'))
const failedCount = computed(() => resultCount('failed'))
</script>
