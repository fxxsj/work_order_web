<template>
  <div class="card mt-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="font-bold">工序和任务管理</span>
      <div class="flex flex-wrap items-center gap-3">
        <RadioGroup :model-value="viewMode" :options="viewModeOptions" size="small" @update:model-value="v => emit('view-mode-change', v)" />
        <button class="btn btn-primary btn-sm" @click="emit('add-process')"><Icon name="plus" class="h-3 w-3" /> 添加工序</button>
      </div>
    </div>
    <div v-if="viewMode === 'list'" class="overflow-x-auto">
      <table class="data-table w-full">
        <thead>
          <tr>
            <th class="w-16 text-center">序号</th>
            <th class="min-w-40">工序名称</th>
            <th class="w-28">状态</th>
            <th class="w-32">负责部门</th>
            <th class="w-28">负责人</th>
            <th class="w-20 text-center">任务数</th>
            <th class="w-44">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in processes" :key="row.id || row.sequence">
            <td class="text-center">{{ row.sequence }}</td>
            <td>{{ row.process_name }}</td>
            <td><StatusTag :status="row.status" category="process" :label="row.status_display" size="small" /></td>
            <td>{{ row.department_name }}</td>
            <td>{{ row.assigned_operator_name }}</td>
            <td class="text-center">{{ row.tasks?.length || 0 }}</td>
            <td><button class="btn btn-ghost btn-sm text-primary-600" @click="emit('process-click', row)">详情</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else title="其他视图暂未实现" />
  </div>
</template>

<script setup lang="ts">
import { Icon, StatusTag, RadioGroup } from '@/components/common'

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
</script>
