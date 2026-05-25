<template>
  <div class="card">
    <div class="card-header flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-900 dark:text-white">我的待处理任务</span>
      <button
        class="btn btn-primary btn-sm"
        @click="emit('view-all')"
      >
        查看全部
      </button>
    </div>
    <div class="card-body">
      <SummaryTable
        :columns="columns"
        :data="tasks"
      >
        <template #cell-work_order="{ row }">
          <button
            v-if="row.work_order_process_info?.work_order?.id"
            class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
            @click="goTo(`/workorders/${row.work_order_process_info.work_order.id}`)"
          >
            {{ row.work_order_process_info.work_order.order_number || '-' }}
          </button>
          <span v-else>-</span>
        </template>
        <template #cell-status="{ row }">
          <StatusTag
            :status="row.status"
            :label="row.status_display"
            category="task"
            size="small"
          />
        </template>
        <template #cell-progress="{ row }">
          <ProgressBar
            :percentage="getProgress(row)"
            :color="getProgress(row) === 100 ? '#67C23A' : '#409EFF'"
          />
        </template>
        <template #cell-actions>
          <button
            class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
            @click="goTo('/tasks')"
          >
            详情
          </button>
        </template>
      </SummaryTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { StatusTag, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

defineProps({ tasks: { type: Array as any, default: () => [] } })
const emit = defineEmits(['view-all'])
const router = useRouter()
const goTo = (path: any) => router.push(path)

const getProgress = (t: any) => t.production_quantity ? Math.round(((t.quantity_completed || 0) / t.production_quantity) * 100) : 0

const columns: Column[] = [
  { key: 'work_order', label: '施工单号', class: 'w-36' },
  { key: 'work_content', label: '任务内容', class: 'min-w-48 max-w-xs truncate' },
  { key: 'status', label: '状态', class: 'w-24' },
  { key: 'progress', label: '进度', class: 'w-36' },
  { key: 'actions', label: '操作', class: 'w-24' },
]
</script>
