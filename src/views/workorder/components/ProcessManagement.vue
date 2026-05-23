<template>
  <div class="card mt-6">
    <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-dark-700">
      <span class="font-bold">工序信息</span>
      <button v-if="editable" class="btn btn-primary btn-sm" @click="emit('add-process')"><Icon name="plus" class="h-3 w-3" /> 添加工序</button>
    </div>
    <div v-for="process in processes" :key="process.id" class="mb-3 border-l-4 bg-gray-50 p-4 dark:bg-dark-800" :style="{ borderLeftColor: getProcessColor(process.status) }">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-bold">{{ process.sequence }}. {{ process.process_name }}</span>
          <StatusTag :status="process.status" category="process" :label="process.status_display" size="small" />
        </div>
        <span class="text-sm">进度: {{ calculateProcessProgress(process) }}%</span>
      </div>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div><span class="text-sm text-gray-500">负责部门:</span> {{ getProcessDepartment(process) }}</div>
        <div><span class="text-sm text-gray-500">负责人:</span> {{ process.assigned_operator_name || '-' }}</div>
        <div><span class="text-sm text-gray-500">开始时间:</span> {{ formatDate(process.started_at) }}</div>
        <div><span class="text-sm text-gray-500">完成时间:</span> {{ formatDate(process.completed_at) }}</div>
      </div>
      <div v-if="process.tasks?.length" class="mt-3">
        <div class="mb-2 text-xs text-gray-400">任务 ({{ process.tasks.length }}):</div>
        <div class="flex flex-wrap gap-2">
          <StatusTag v-for="task in process.tasks" :key="task.id" :status="task.status" category="task" :label="task.work_content" size="small" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'
import { StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({ processes: { type: Array as any, default: () => [] }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['add-process', 'start-process', 'complete-process', 'click-process'])
const getProcessColor = (s: any) => ({ pending: '#909399', in_progress: '#409EFF', completed: '#67C23A', draft: '#E6A23C' } as any)[s] || '#909399'
const getProcessDepartment = (p: any) => p.department_name || '-'
const calculateProcessProgress = (p: any) => p.tasks?.length ? Math.round((p.tasks.filter((t: any) => t.status === 'completed').length / p.tasks.length) * 100) : 0
</script>