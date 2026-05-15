<template>
  <div class="task-card" :class="{ 'task-card-overdue': isOverdue }" @click="emit('click', task)">
    <div class="task-header">
      <div class="task-header-left">
        <span class="task-order-number">{{ orderNumber }}</span>
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
    <div class="task-content">
      <div class="task-title">{{ task.work_content }}</div>
      <div class="task-info"><div class="task-info-item"><el-icon><User /></el-icon>{{ operatorName }}</div><div class="task-info-item"><el-icon><DataLine /></el-icon>{{ progressText }}</div></div>
      <div v-if="deadlineText" class="task-deadline" :class="deadlineClass"><el-icon><Clock /></el-icon>{{ deadlineText }}</div>
      <div v-if="hasDefective" class="task-defective"><el-icon><Warning /></el-icon>不良品：{{ task.quantity_defective }}</div>
      <div class="task-progress"><el-progress :percentage="progressPercentage" :color="progressColor" :show-text="false" :stroke-width="6" /></div>
    </div>
    <div class="task-actions">
      <el-button v-if="canUpdate" type="primary" size="small" :icon="Edit" @click.stop="emit('update', task)">更新</el-button>
      <el-button v-if="canAssign" type="warning" size="small" :icon="User" @click.stop="emit('assign', task)">分派</el-button>
      <el-button v-if="canComplete" type="success" size="small" :icon="Check" @click.stop="emit('complete', task)">完成</el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { User, DataLine, Clock, Warning, Edit, Check } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ task: { type: Object, required: true }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['click', 'update', 'assign', 'complete'])

const orderNumber = computed(() => props.task.work_order_process_info?.work_order?.order_number || '-')
const priority = computed(() => props.task.work_order_process_info?.work_order?.priority)
const priorityDisplay = computed(() => props.task.work_order_process_info?.work_order?.priority_display || '')
const taskTypeDisplay = computed(() => props.task.task_type_display || '')
const operatorName = computed(() => props.task.assigned_operator_name || '未分配')
const progressText = computed(() => `${props.task.quantity_completed || 0} / ${props.task.production_quantity || 0}`)
const progressPercentage = computed(() => props.task.production_quantity ? Math.round(((props.task.quantity_completed || 0) / props.task.production_quantity) * 100) : 0)
const progressColor = computed(() => progressPercentage.value === 100 ? 'var(--ui-color-success)' : 'var(--ui-color-primary)')
const isOverdue = computed(() => { const dl = props.task.deadline || props.task.due_date; return dl && new Date(dl) < new Date() })
const getRemainingDays = (task) => { const dl = task.deadline || task.due_date; if (!dl) return null; return Math.ceil((new Date(dl) - new Date()) / (1000 * 60 * 60 * 24)) }
const deadlineText = computed(() => { const days = getRemainingDays(props.task); if (days === null) return null; if (days < 0) return `逾期 ${Math.abs(days)} 天`; if (days === 0) return '今天到期'; if (days === 1) return '明天到期'; return `${days} 天后到期` })
const deadlineClass = computed(() => { const days = getRemainingDays(props.task); if (days === null) return ''; return days < 0 ? 'deadline-overdue' : days <= 2 ? 'deadline-urgent' : 'deadline-normal' })
const hasDefective = computed(() => (props.task.quantity_defective || 0) > 0)
const canUpdate = computed(() => props.editable && props.task.status !== 'completed' && props.task.status !== 'cancelled')
const canAssign = computed(() => props.editable && props.task.status !== 'completed')
const canComplete = computed(() => props.editable && props.task.status !== 'completed')
</script>

<style scoped>
.task-card { border: 1px solid var(--ui-color-border-strong); border-radius: var(--ui-radius-card); padding: var(--ui-stat-content-gap); margin-bottom: var(--ui-stat-content-gap); cursor: pointer; transition: all var(--ui-transition-base); background-color: #fff; }
.task-card:hover { box-shadow: var(--ui-shadow-card); border-color: var(--ui-color-primary); }
.task-card-overdue { border-left: 3px solid var(--ui-color-danger); }
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--ui-control-gap); gap: var(--ui-control-gap); }
.task-header-left { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); flex: 1; }
.task-order-number { font-size: var(--ui-font-size-xs); color: var(--ui-color-text-regular); font-weight: 700; }
.task-content { margin-bottom: var(--ui-stat-content-gap); }
.task-title { font-size: var(--ui-font-size-sm); color: var(--ui-color-text-primary); margin-bottom: var(--ui-control-gap); font-weight: 500; line-height: 1.5; }
.task-info { display: flex; justify-content: space-between; margin-bottom: var(--ui-control-gap); gap: var(--ui-control-gap); }
.task-info-item { font-size: var(--ui-font-size-xs); color: var(--ui-color-text-secondary); display: flex; align-items: center; gap: var(--ui-inline-gap); }
.task-deadline { font-size: var(--ui-font-size-xs); padding: var(--ui-compact-padding-y) var(--ui-compact-padding-x); border-radius: var(--ui-radius-card); margin-bottom: var(--ui-control-gap); display: flex; align-items: center; gap: var(--ui-inline-gap); }
.deadline-normal { background-color: var(--ui-color-primary-light); color: var(--ui-color-primary); }
.deadline-urgent { background-color: var(--ui-color-warning-light); color: var(--ui-color-warning); }
.deadline-overdue { background-color: var(--ui-color-danger-light); color: var(--ui-color-danger); }
.task-defective { font-size: var(--ui-font-size-xs); color: var(--ui-color-warning); margin-bottom: var(--ui-control-gap); display: flex; align-items: center; gap: var(--ui-inline-gap); }
.task-progress { margin-top: var(--ui-control-gap); }
.task-actions { display: flex; gap: var(--ui-control-gap); padding-top: var(--ui-control-gap); border-top: 1px solid var(--ui-color-border); }
.task-actions :deep(.el-button) { flex: 1; }
</style>
