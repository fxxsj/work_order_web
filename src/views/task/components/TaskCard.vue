<template>
  <div class="task-card" :class="{ 'task-card-overdue': isOverdue }" @click="emit('click', task)">
    <div class="task-header">
      <div class="task-header-left"><span class="task-order-number">{{ orderNumber }}</span><el-tag v-if="priority" :type="priorityTagType" size="small" style="margin-left: 5px;">{{ priorityDisplay }}</el-tag></div>
      <el-tag :type="taskTypeTagType" size="small">{{ taskTypeDisplay }}</el-tag>
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
import { User, DataLine, Clock, Warning, Edit, User, Check } from '@element-plus/icons-vue'

const props = defineProps({ task: { type: Object, required: true }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['click', 'update', 'assign', 'complete'])

const orderNumber = computed(() => props.task.work_order_process_info?.work_order?.order_number || '-')
const priority = computed(() => props.task.work_order_process_info?.work_order?.priority)
const priorityDisplay = computed(() => props.task.work_order_process_info?.work_order?.priority_display || '')
const priorityTagType = computed(() => ({ low: 'info', normal: 'success', high: 'warning', urgent: 'danger' })[priority.value] || 'info')
const taskTypeDisplay = computed(() => props.task.task_type_display || '')
const taskTypeTagType = computed(() => ({ plate_making: 'success', cutting: 'info', printing: 'primary', foiling: 'warning', embossing: 'warning', die_cutting: 'warning', packaging: 'info', general: 'info' })[props.task.task_type] || 'info')
const operatorName = computed(() => props.task.assigned_operator_name || '未分配')
const progressText = computed(() => `${props.task.quantity_completed || 0} / ${props.task.production_quantity || 0}`)
const progressPercentage = computed(() => props.task.production_quantity ? Math.round(((props.task.quantity_completed || 0) / props.task.production_quantity) * 100) : 0)
const progressColor = computed(() => progressPercentage.value === 100 ? '#67C23A' : '#409EFF')
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
.task-card { border: 1px solid #DCDFE6; border-radius: 4px; padding: 12px; margin-bottom: 12px; cursor: pointer; transition: all 0.3s; background-color: white; }
.task-card:hover { box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); border-color: #409EFF; }
.task-card-overdue { border-left: 3px solid #F56C6C; }
.task-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.task-header-left { display: flex; align-items: center; flex: 1; }
.task-order-number { font-size: 12px; color: #606266; font-weight: bold; }
.task-content { margin-bottom: 12px; }
.task-title { font-size: 14px; color: #303133; margin-bottom: 10px; font-weight: 500; line-height: 1.5; }
.task-info { display: flex; justify-content: space-between; margin-bottom: 8px; }
.task-info-item { font-size: 12px; color: #909399; display: flex; align-items: center; gap: 4px; }
.task-deadline { font-size: 12px; padding: 4px 8px; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; }
.deadline-normal { background-color: #F0F9FF; color: #409EFF; }
.deadline-urgent { background-color: #FDF6EC; color: #E6A23C; }
.deadline-overdue { background-color: #FEF0F0; color: #F56C6C; }
.task-defective { font-size: 12px; color: #E6A23C; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; }
.task-progress { margin-top: 8px; }
.task-actions { display: flex; gap: 8px; padding-top: 10px; border-top: 1px solid #EBEEF5; }
.task-actions :deep(.el-button) { flex: 1; }
</style>
