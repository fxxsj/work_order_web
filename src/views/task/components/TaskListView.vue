<template>
  <div class="mt-6">
    <DataTable :columns="columns" :data="tasks" :loading="loading" row-key="id">
      <template #cell-order_number="{ row }">{{ row.work_order_process_info?.work_order?.order_number || '-' }}</template>
      <template #cell-task_type="{ row }"><StatusTag :status="row.task_type" category="taskType" :label="row.task_type_display" size="small" /></template>
      <template #cell-status="{ row }"><StatusTag :status="row.status" category="task" :label="row.status_display" size="small" /></template>
      <template #cell-operator="{ row }">{{ row.assigned_operator_name || '未分配' }}</template>
      <template #cell-progress="{ row }"><ProgressBar :percentage="calculateProgress(row)" :color="getProgressColor(row)" /></template>
      <template #cell-deadline="{ row }"><span :class="isOverdue(row) ? 'font-bold text-danger-600 dark:text-danger-400' : ''">{{ formatDate(getTaskDeadline(row)) }}</span></template>
      <template #cell-actions="{ row }">
        <RowActions
          :actions="getRowActions(row)"
          @action="(action) => handleRowAction(action, row)"
        />
      </template>
    </DataTable>
    <div class="mt-6 flex justify-end">
      <Pagination
        :page="currentPage"
        :page-size="pageSize"
        :page-size-options="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page-size="v => emit('page-size-change', v)"
        @update:page="v => emit('page-change', v)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { StatusTag, Pagination, Icon, DataTable, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { formatDate } from '@/utils/filter'

const props = defineProps({ tasks: { type: Array as any, default: () => [] }, editable: { type: Boolean, default: false }, loading: { type: Boolean, default: false }, total: { type: Number, default: 0 }, currentPage: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 } })
const emit = defineEmits(['task-update', 'task-assign', 'task-complete', 'page-size-change', 'page-change'])

const columns: Column[] = [
  { key: 'id', label: '任务ID', width: 80, align: 'center' },
  { key: 'order_number', label: '施工单号', width: 160 },
  { key: 'work_content', label: '任务内容', minWidth: 208 },
  { key: 'task_type', label: '任务类型', width: 128 },
  { key: 'status', label: '状态', width: 112, align: 'center' },
  { key: 'operator', label: '操作员', width: 128 },
  { key: 'progress', label: '进度', width: 160 },
  { key: 'deadline', label: '截止日期', width: 128 },
  { key: 'actions', label: '操作', width: 200, fixed: 'right' },
]

const getTaskDeadline = (task: any) => task.deadline || task.due_date || null;
const calculateProgress = (task: any) => task.production_quantity ? Math.round(((task.quantity_completed || 0) / task.production_quantity) * 100) : 0;
const getProgressColor = (task: any) => calculateProgress(task) === 100 ? '#67c23a' : '#14b8a6';
const isOverdue = (task: any) => { const dl = getTaskDeadline(task); return dl && new Date(dl) < new Date() };

const canUpdate = (task: any) => props.editable && task.status !== 'completed' && task.status !== 'cancelled';
const canAssign = (task: any) => props.editable && task.status !== 'completed';
const canComplete = (task: any) => props.editable && task.status !== 'completed';

const getRowActions = (row: any): RowAction[] => [
  { key: 'update', label: '更新', icon: 'edit', tone: 'primary', visible: canUpdate(row) },
  { key: 'assign', label: '分派', icon: 'user', tone: 'warning', visible: canAssign(row) },
  { key: 'complete', label: '完成', icon: 'checkCircle', tone: 'success', visible: canComplete(row) },
]

const handleRowAction = (action: RowAction, row: any) => {
  if (action.key === 'update') emit('task-update', row)
  else if (action.key === 'assign') emit('task-assign', row)
  else if (action.key === 'complete') emit('task-complete', row)
}
</script>
