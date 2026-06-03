<template>
  <div
    class="card card-hover mb-3 cursor-pointer"
    :class="{ 'border-l-4 border-l-danger-500': isOverdue }"
    @click="emit('click', task)"
  >
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-bold text-gray-500 dark:text-dark-400">{{ orderNumber }}</span>
        <StatusTag
          v-if="priority"
          :status="priority"
          category="priority"
          :label="priorityDisplay"
          size="small"
        />
      </div>
      <StatusTag
        :status="task.task_type"
        category="taskType"
        :label="taskTypeDisplay"
        size="small"
      />
    </div>
    <div class="mb-3">
      <div class="mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ task.work_content }}
      </div>
      <div class="mb-2 flex justify-between text-xs text-gray-500 dark:text-dark-400">
        <span><Icon
          name="user"
          class="mr-1 inline h-3 w-3"
        />{{ operatorName }}</span>
        <span><Icon
          name="chartBar"
          class="mr-1 inline h-3 w-3"
        />{{ progressText }}</span>
      </div>
      <div
        v-if="deadlineText"
        class="mb-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
        :class="deadlineClass"
      >
        <Icon
          name="clock"
          class="h-3 w-3"
        />{{ deadlineText }}
      </div>
      <div
        v-if="hasDefective"
        class="mb-2 flex items-center gap-1 text-xs text-warning-600 dark:text-warning-400"
      >
        <Icon
          name="exclamationTriangle"
          class="h-3 w-3"
        />不良品：{{ task.quantity_defective }}
      </div>
      <ProgressBar
        :percentage="progressPercentage"
        :status="progressStatus"
        :show-text="false"
        :stroke-width="6"
      />
    </div>
    <div class="flex gap-2 border-t border-gray-200 pt-2 dark:border-dark-700">
      <BaseButton
        v-if="canUpdate"
        variant="primary"
        size="sm"
        class="flex-1"
        @click.stop="emit('update', task)"
      >
        更新
      </BaseButton>
      <BaseButton
        v-if="canAssign"
        variant="warning"
        size="sm"
        class="flex-1"
        @click.stop="emit('assign', task)"
      >
        分派
      </BaseButton>
      <BaseButton
        v-if="canComplete"
        variant="success"
        size="sm"
        class="flex-1"
        @click.stop="emit('complete', task)"
      >
        完成
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton, Icon, StatusTag } from '@/components/common'

const props = defineProps({ task: { type: Object, required: true }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['click', 'update', 'assign', 'complete'])

const orderNumber = computed(() => props.task.work_order_process_info?.work_order?.order_number || '-')
const priority = computed(() => props.task.work_order_process_info?.work_order?.priority)
const priorityDisplay = computed(() => props.task.work_order_process_info?.work_order?.priority_display || '')
const taskTypeDisplay = computed(() => props.task.task_type_display || '')
const operatorName = computed(() => props.task.assigned_operator_name || '未分配')
const progressText = computed(() => `${props.task.quantity_completed || 0} / ${props.task.production_quantity || 0}`)
const progressPercentage = computed(() => props.task.production_quantity ? Math.round(((props.task.quantity_completed || 0) / props.task.production_quantity) * 100) : 0)
const progressStatus = computed(() => progressPercentage.value === 100 ? 'success' : 'active')
const isOverdue = computed(() => { const dl = props.task.deadline; return dl && new Date(dl) < new Date() })
const getRemainingDays = (task: any) => { const dl = task.deadline; if (!dl) return null; return Math.ceil((new Date(dl).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) }
const deadlineText = computed(() => { const days = getRemainingDays(props.task); if (days === null) return null; if (days < 0) return `逾期 ${Math.abs(days)} 天`; if (days === 0) return '今天到期'; if (days === 1) return '明天到期'; return `${days} 天后到期` })
const deadlineClass = computed(() => { const days = getRemainingDays(props.task); if (days === null) return ''; return days < 0 ? 'bg-danger-50 text-danger-600 dark:bg-dark-700 dark:text-danger-400' : days <= 2 ? 'bg-warning-50 text-warning-600 dark:bg-dark-700 dark:text-warning-400' : 'bg-primary-50 text-primary-600 dark:bg-dark-700 dark:text-primary-400' })
const hasDefective = computed(() => (props.task.quantity_defective || 0) > 0)
const canUpdate = computed(() => props.editable && props.task.status !== 'completed' && props.task.status !== 'cancelled')
const canAssign = computed(() => props.editable && props.task.status !== 'completed')
const canComplete = computed(() => props.editable && props.task.status !== 'completed')
</script>
