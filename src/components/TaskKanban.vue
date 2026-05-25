<template>
  <div class="p-5">
    <div class="flex gap-6 overflow-x-auto">
      <div
        v-for="column in columns"
        :key="column.status"
        class="flex-shrink-0 flex-1"
        style="min-width: 280px; max-width: 360px;"
      >
        <!-- Column Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-dark-800 rounded-t-2xl border-b-2 border-gray-200 dark:border-dark-700">
          <span class="font-medium text-sm text-gray-900 dark:text-white">{{ column.title }}</span>
          <span class="badge badge-gray">{{ column.tasks.length }}</span>
        </div>

        <!-- Column Content -->
        <div class="bg-gray-50 dark:bg-dark-900/50 min-h-64 p-3 rounded-b-2xl space-y-3">
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="card card-hover p-4 cursor-pointer"
            @click="handleTaskClick(task)"
          >
            <!-- Card Header -->
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="font-medium text-sm text-gray-900 dark:text-white flex-1 min-w-0 truncate">
                {{ task.work_content }}
              </div>
              <StatusTag
                :status="task.task_type"
                category="taskType"
                :label="task.task_type_display"
                size="small"
              />
            </div>

            <!-- Card Body -->
            <div class="mb-3 space-y-2">
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400">
                <Icon
                  name="document"
                  class="h-3 w-3"
                />
                <span>{{ task.work_order_number || '-' }}</span>
              </div>
              <div
                v-if="task.assigned_department_name"
                class="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400"
              >
                <Icon
                  name="building"
                  class="h-3 w-3"
                />
                <span>{{ task.assigned_department_name }}</span>
              </div>
              <div
                v-if="task.assigned_operator_name"
                class="flex items-center gap-2 text-xs text-gray-500 dark:text-dark-400"
              >
                <Icon
                  name="user"
                  class="h-3 w-3"
                />
                <span>{{ task.assigned_operator_name }}</span>
              </div>
            </div>

            <!-- Progress -->
            <div
              v-if="task.production_quantity > 0"
              class="mb-3"
            >
              <div class="flex justify-between text-xs text-gray-500 dark:text-dark-400 mb-1">
                <span>进度: {{ getProgressPercentage(task) }}%</span>
                <span>{{ task.quantity_completed || 0 }}/{{ task.production_quantity }}</span>
              </div>
              <ProgressBar
                :percentage="getProgressPercentage(task)"
                :status="getProgressStatus(task)"
                :stroke-width="6"
              />
            </div>

            <!-- Card Footer -->
            <div class="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-dark-700">
              <StatusTag
                v-if="task.priority"
                :status="task.priority"
                category="priority"
                :label="task.priority_display"
                size="small"
                effect="plain"
              />
              <span
                class="flex items-center gap-1 text-xs"
                :class="isOverdue(task) ? 'text-danger-500' : 'text-gray-500 dark:text-dark-400'"
              >
                <Icon
                  name="clock"
                  class="h-3 w-3"
                />
                {{ formatDate(task.deadline) }}
              </span>
            </div>
          </div>

          <EmptyState
            v-if="column.tasks.length === 0"
            title="暂无任务"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag } from '@/components/common'

const props = defineProps({
  tasks: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['task-click'])

const columns = computed(() => {
  const statusMap = {
    pending: { title: '待开始', status: 'pending' },
    in_progress: { title: '进行中', status: 'in_progress' },
    completed: { title: '已完成', status: 'completed' }
  }
  return Object.values(statusMap).map((col: any) => ({
    ...col,
    tasks: props.tasks.filter((task: any) => task.status === col.status)
  }))
})

const handleTaskClick = (task: any) => emit('task-click', task)

const getProgressPercentage = (task: any) => {
  if (!task.production_quantity) return 0
  return Math.round(((task.quantity_completed || 0) / task.production_quantity) * 100)
}

const getProgressStatus = (task: any) => {
  const percentage = getProgressPercentage(task)
  if (percentage >= 100) return 'success'
  if (percentage >= 80) return 'warning'
  return ''
}

const isOverdue = (task: any) => {
  if (!task.deadline) return false
  return new Date(task.deadline) < new Date() && task.status !== 'completed'
}

const formatDate = (date: any) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>
