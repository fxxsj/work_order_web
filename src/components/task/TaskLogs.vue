<template>
  <div
    v-if="task.logs?.length"
    class="rounded-xl bg-gray-100 p-6 dark:bg-dark-800"
  >
    <div class="mb-3 font-bold text-primary-600">
      {{ task.work_content }} - 操作记录（{{ task.logs.length }}条）
    </div>
    <SummaryTable
      :columns="columns"
      :data="task.logs"
      row-key="id"
    >
      <template #cell-quantity_change="{ row }">
        <span v-if="row.quantity_before !== null && row.quantity_after !== null">{{ row.quantity_before }} → {{ row.quantity_after }}
          <span
            v-if="row.quantity_increment > 0"
            class="ml-1 font-bold text-success-600"
          >(+{{ row.quantity_increment }})</span>
          <span
            v-else-if="row.quantity_increment < 0"
            class="ml-1 font-bold text-danger-600"
          >({{ row.quantity_increment }})</span>
        </span>
        <span v-else>-</span>
      </template>
      <template #cell-status_change="{ row }">
        <span v-if="row.status_before && row.status_after">{{ getStatusText(row.status_before) }} → {{ getStatusText(row.status_after) }}</span>
        <span v-else>-</span>
      </template>
    </SummaryTable>
  </div>
  <div
    v-else
    class="py-6 text-center text-gray-400"
  >
    暂无操作记录
  </div>
</template>

<script setup lang="ts">
import { SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

defineProps({ task: { type: Object, required: true } })
const getStatusText = (s: any) => ({ pending: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消' } as any)[s] || s

const columns: Column[] = [
  { key: 'created_at', label: '操作时间', width: 160 },
  { key: 'operator_name', label: '操作人', width: 128 },
  { key: 'log_type_display', label: '操作类型', width: 112 },
  { key: 'quantity_change', label: '数量变化', width: 176 },
  { key: 'status_change', label: '状态变化', width: 160 },
  { key: 'content', label: '操作内容', minWidth: 208 }
]
</script>
