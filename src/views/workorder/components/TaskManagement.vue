<template>
  <div class="mt-6 overflow-x-auto">
    <SummaryTable
      :columns="columns"
      :data="tasks"
    >
      <template #cell-work_content="{ row }">
        {{ row.work_content || row.task_name || '-' }}
      </template>
      <template #cell-operator="{ row }">
        {{ row.assigned_operator_name || row.operator_name || '-' }}
      </template>
      <template #cell-status="{ row }">
        <StatusTag
          :status="row.status"
          category="task"
          :label="row.status_display"
          size="small"
        />
      </template>
      <template #cell-progress="{ row }">
        <ProgressBar
          :percentage="calculateTaskProgress(row)"
          :color="getProgressColor(row)"
        />
      </template>
      <template #cell-quantity="{ row }">
        {{ row.quantity_completed || 0 }} / {{ row.production_quantity || 0 }}
      </template>
    </SummaryTable>
  </div>
</template>

<script setup lang="ts">
import { StatusTag, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

defineProps({ tasks: { type: Array as any, default: () => [] } })

const columns: Column[] = [
  { key: 'id', label: '任务ID', width: 80, align: 'center' },
  { key: 'work_content', label: '任务名称' },
  { key: 'operator', label: '操作员', width: 112 },
  { key: 'status', label: '状态', width: 112, align: 'center' },
  { key: 'progress', label: '进度', width: 128, align: 'center' },
  { key: 'quantity', label: '完成数量', width: 112, align: 'right' },
]

const calculateTaskProgress = (t: any) => t.production_quantity ? Math.round(((t.quantity_completed || 0) / t.production_quantity) * 100) : 0
const getProgressColor = (t: any) => calculateTaskProgress(t) === 100 ? 'var(--ui-color-success)' : 'var(--ui-color-primary)'
</script>
