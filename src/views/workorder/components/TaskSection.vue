<template>
  <div class="p-3">
    <LoadingSpinner
      v-if="loading"
      size="lg"
      class="mx-auto my-8 block"
    />
    <template v-else>
      <div class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div class="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20">
          <div class="text-2xl font-bold text-blue-600">
            {{ taskStats.total }}
          </div><div class="text-xs text-gray-500">
            全部任务
          </div>
        </div>
        <div class="rounded-xl bg-gray-100 p-4 text-center dark:bg-dark-700">
          <div class="text-2xl font-bold text-gray-500">
            {{ taskStats.draft }}
          </div><div class="text-xs text-gray-500">
            草稿
          </div>
        </div>
        <div class="rounded-xl bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
          <div class="text-2xl font-bold text-yellow-600">
            {{ taskStats.pending }}
          </div><div class="text-xs text-gray-500">
            待处理
          </div>
        </div>
        <div class="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
          <div class="text-2xl font-bold text-green-600">
            {{ taskStats.completed }}
          </div><div class="text-xs text-gray-500">
            已完成
          </div>
        </div>
        <div class="rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-900/20">
          <CircularProgress
            :percentage="taskStats.progress || 0"
            :size="60"
            :stroke-width="8"
          /><div class="mt-1 text-xs text-gray-500">
            完成进度
          </div>
        </div>
      </div>
      <SummaryTable
        :columns="columns"
        :data="tasks"
        row-key="id"
      >
        <template #cell-status="{ row }">
          <StatusTag
            :status="row.status"
            category="task"
            :label="row.status_display"
            size="small"
          />
        </template>
      </SummaryTable>
    </template>
  </div>
</template>

<script setup lang="ts">
import { StatusTag, CircularProgress, LoadingSpinner, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({ tasks: { type: Array as any, default: () => [] }, taskStats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })

const columns: Column[] = [
  { key: 'id', label: 'ID', width: 80, align: 'center' },
  { key: 'work_content', label: '任务内容', minWidth: 160 },
  { key: 'task_type_display', label: '类型', width: 120 },
  { key: 'status', label: '状态', width: 120 },
  { key: 'production_quantity', label: '数量', width: 80, align: 'center' }
]
</script>
