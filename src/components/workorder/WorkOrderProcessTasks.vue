<template>
  <div class="card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="text-lg font-bold">工序和任务管理</span>
      <div class="flex flex-wrap items-center gap-3">
        <button
          v-if="canSyncTasks"
          class="btn btn-secondary btn-sm"
          :disabled="!processes?.length"
          @click="emit('sync-tasks')"
        >
          <Icon
            name="refresh"
            class="h-3 w-3"
          /> 同步工序任务
        </button>
        <button
          v-if="unassignedTasks.length"
          class="btn btn-secondary btn-sm"
          @click="emit('open-task-assignment')"
        >
          <Icon
            name="user"
            class="h-3 w-3"
          /> 未分派 {{ unassignedTasks.length }}
        </button>
        <button
          class="btn btn-primary btn-sm"
          @click="emit('add-process')"
        >
          <Icon
            name="plus"
            class="h-3 w-3"
          /> 添加工序
        </button>
      </div>
    </div>
    <div
      v-if="taskStatusSummary.total > 0"
      class="mb-4 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-dark-300"
    >
      <span class="rounded-md bg-gray-100 px-2 py-1 dark:bg-dark-800">任务 {{ taskStatusSummary.total }}</span>
      <span class="rounded-md bg-success-50 px-2 py-1 text-success-700">已分派 {{ taskStatusSummary.assigned }}</span>
      <span
        v-if="taskStatusSummary.unassigned"
        class="rounded-md bg-warning-50 px-2 py-1 text-warning-700"
      >未分派 {{ taskStatusSummary.unassigned }}</span>
    </div>
    <SummaryTable
      v-if="viewMode === 'list'"
      :columns="columns"
      :data="processes"
      :row-key="rowKey"
    >
      <template #cell-status="{ row }">
        <StatusTag
          :status="row.status"
          category="process"
          :label="row.status_display"
          size="small"
        />
      </template>
      <template #cell-task_count="{ row }">
        {{ row.tasks?.length || 0 }}
      </template>
      <template #cell-actions="{ row }">
        <button
          class="btn btn-ghost btn-sm text-primary-600"
          @click="emit('process-click', row)"
        >
          详情
        </button>
      </template>
    </SummaryTable>
    <div
      v-if="processTaskGroups.length"
      class="mt-5 space-y-3"
    >
      <div
        v-for="group in processTaskGroups"
        :key="group.id"
        class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800"
      >
        <div class="mb-3 font-medium text-gray-900 dark:text-white">
          {{ group.processName }}
        </div>
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="task in group.tasks"
            :key="task.id"
            class="rounded-md border border-gray-100 bg-white p-3 text-sm dark:border-dark-700 dark:bg-dark-900"
          >
            <div class="font-medium text-gray-900 dark:text-white">
              {{ task.task_name || task.name || task.process_name || '任务' }}
            </div>
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-dark-400">
              <span>状态：{{ task.status_display || task.status || '-' }}</span>
              <span>部门：{{ task.assigned_department_name || '-' }}</span>
              <span>操作员：{{ task.assigned_operator_name || '-' }}</span>
              <span>进度：{{ task.completed_quantity ?? 0 }}/{{ task.quantity ?? task.planned_quantity ?? '-' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({
  workOrder: { type: Object, default: null },
  processes: { type: Array as any, default: () => [] },
  allTasks: { type: Array as any, default: () => [] },
  viewMode: { type: String, default: 'list' },
  canSyncTasks: { type: Boolean, default: false }
})

const emit = defineEmits(['add-process', 'process-click', 'sync-tasks', 'open-task-assignment'])

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
const processTaskGroups = computed(() =>
  props.processes
    .map((process: any, index: number) => ({
      id: process.id || index,
      processName: process.process_name || `工序 ${index + 1}`,
      tasks: Array.isArray(process.tasks) ? process.tasks : []
    }))
    .filter((group: any) => group.tasks.length > 0)
)
const allProcessTasks = computed(() => processTaskGroups.value.flatMap((group: any) => group.tasks))
const unassignedTasks = computed(() => allProcessTasks.value.filter((task: any) => !task.assigned_operator && !task.assigned_operator_name))
const taskStatusSummary = computed(() => {
  const total = allProcessTasks.value.length
  const unassigned = unassignedTasks.value.length
  return {
    total,
    unassigned,
    assigned: total - unassigned
  }
})
</script>
