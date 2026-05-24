<template>
  <div class="card mt-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="font-bold">工序和任务管理</span>
      <div class="flex flex-wrap items-center gap-3">
        <RadioGroup :model-value="viewMode" :options="viewModeOptions" size="small" @update:model-value="v => emit('view-mode-change', v)" />
        <button class="btn btn-primary btn-sm" @click="emit('add-process')"><Icon name="plus" class="h-3 w-3" /> 添加工序</button>
      </div>
    </div>
    <SummaryTable v-if="viewMode === 'list'" :columns="columns" :data="processes" :row-key="rowKey">
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" category="process" :label="row.status_display" size="small" />
      </template>
      <template #cell-task_count="{ row }">
        {{ row.tasks?.length || 0 }}
      </template>
      <template #cell-actions="{ row }">
        <button class="btn btn-ghost btn-sm text-primary-600" @click="emit('process-click', row)">详情</button>
      </template>
    </SummaryTable>
    <EmptyState v-else title="其他视图暂未实现" />
  </div>
</template>

<script setup lang="ts">
import { Icon, StatusTag, RadioGroup, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({
  workOrder: { type: Object, default: null },
  processes: { type: Array as any, default: () => [] },
  allTasks: { type: Array as any, default: () => [] },
  viewMode: { type: String, default: 'list' }
})

const emit = defineEmits(['add-process', 'process-click', 'view-mode-change'])

const viewModeOptions = [
  { value: 'timeline', label: '时间线' },
  { value: 'flowchart', label: '流程图' },
  { value: 'list', label: '列表' }
]

const columns: Column[] = [
  { key: 'sequence', label: '序号', width: 64, align: 'center' },
  { key: 'process_name', label: '工序名称', minWidth: 160 },
  { key: 'status', label: '状态', width: 112 },
  { key: 'department_name', label: '负责部门', width: 128 },
  { key: 'assigned_operator_name', label: '负责人', width: 112 },
  { key: 'task_count', label: '任务数', width: 80, align: 'center' },
  { key: 'actions', label: '操作', width: 176 },
]

const rowKey = (row: any, index: number) => row.id || row.sequence || index
</script>
