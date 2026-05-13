<template>
  <div class="task-drag-drop">
    <div class="column unassigned-column" :class="{ 'drag-over': dragOverColumn === 'unassigned' }" @dragover.prevent @dragenter="dragOverColumn = 'unassigned'" @dragleave="dragOverColumn = null" @drop="handleDropUnassigned">
      <div class="column-header"><span class="column-title">待分派任务</span><el-badge :value="unassignedTasks.length" type="warning" /></div>
      <div class="column-content">
        <div v-for="task in unassignedTasks" :key="task.id" class="task-card" :class="getPriorityClass(task)" draggable="true" @dragstart="onDragStart(task, $event)">
          <div class="card-header"><div class="card-title">{{ task.work_content }}</div><el-tag v-if="task.work_order__priority" :type="getPriorityType(task.work_order__priority)" size="small">{{ getPriorityLabel(task.work_order__priority) }}</el-tag></div>
          <div class="card-body"><div class="info-item"><el-icon><Document /></el-icon><span>{{ task.work_order__order_number || '-' }}</span></div><div class="info-item"><el-icon><Setting /></el-icon><span>{{ task.process_name || '-' }}</span></div><div class="info-item"><el-icon><Tickets /></el-icon><span>数量: {{ task.production_quantity }}</span></div></div>
          <div class="card-footer"><el-tag size="small" :type="getStatusType(task.status)">{{ getStatusLabel(task.status) }}</el-tag></div>
        </div>
        <el-empty v-if="unassignedTasks.length === 0" description="暂无待分派任务" :image-size="80" />
      </div>
    </div>
    <div v-for="operator in operators" :key="operator.id" class="column operator-column" :class="{ 'drag-over': dragOverOperator === operator.id }" @drop="handleDropOperator(operator)" @dragover.prevent @dragenter="dragOverOperator = operator.id" @dragleave="dragOverOperator = null">
      <div class="column-header"><span class="column-title">{{ operator.name }}</span><el-badge :value="getOperatorTaskCount(operator.id)" type="primary" /></div>
      <div class="column-content">
        <div v-for="task in operatorTasks[operator.id] || []" :key="task.id" class="task-card" :class="getPriorityClass(task)" draggable="true" @dragstart="onDragStart(task, $event)">
          <div class="card-header"><div class="card-title">{{ task.work_content }}</div><el-tag v-if="task.work_order__priority" :type="getPriorityType(task.work_order__priority)" size="small">{{ getPriorityLabel(task.work_order__priority) }}</el-tag></div>
          <div class="card-body"><div class="info-item"><el-icon><Document /></el-icon><span>{{ task.work_order__order_number || '-' }}</span></div><div class="info-item"><el-icon><Setting /></el-icon><span>{{ task.process_name || '-' }}</span></div></div>
          <div class="card-footer"><el-tag size="small" :type="getStatusType(task.status)">{{ getStatusLabel(task.status) }}</el-tag></div>
        </div>
        <el-empty v-if="!operatorTasks[operator.id]?.length" description="暂无任务" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Document, Setting, Tickets } from '@element-plus/icons-vue'

const props = defineProps({ tasks: { type: Array, default: () => [] }, operators: { type: Array, default: () => [] } })
const emit = defineEmits(['task-assigned', 'task-reassigned', 'task-unassigned'])

const unassignedTasks = ref([])
const operatorTasks = ref({})
const dragOverOperator = ref(null)
const dragOverColumn = ref(null)
const draggedTask = ref(null)
const draggedFromOperator = ref(null)

watch(() => props.tasks, () => organizeTasks(), { immediate: true, deep: true })
watch(() => props.operators, () => initializeOperatorTasks(), { immediate: true, deep: true })

const organizeTasks = () => {
  unassignedTasks.value = props.tasks.filter(t => !t.assigned_operator && t.status !== 'completed')
  props.operators.forEach(op => { if (!operatorTasks.value[op.id]) operatorTasks.value[op.id] = []; operatorTasks.value[op.id] = props.tasks.filter(t => t.assigned_operator === op.id) })
}

const initializeOperatorTasks = () => { props.operators.forEach(op => { if (!operatorTasks.value[op.id]) operatorTasks.value[op.id] = [] }) }
const getOperatorTaskCount = (id) => operatorTasks.value[id]?.length || 0

const onDragStart = (task, event) => { draggedTask.value = task; draggedFromOperator.value = task.assigned_operator; event.dataTransfer.effectAllowed = 'move' }

const handleDropOperator = (operator) => {
  if (!draggedTask.value) return
  if (draggedTask.value.assigned_operator === operator.id) return
  if (draggedFromOperator.value) emit('task-reassigned', { task: draggedTask.value, fromOperator: props.operators.find(o => o.id === draggedFromOperator.value), toOperator: operator })
  else emit('task-assigned', { task: draggedTask.value, operator })
  resetDrag()
}

const handleDropUnassigned = () => {
  if (!draggedTask.value || !draggedTask.value.assigned_operator) return
  emit('task-unassigned', { task: draggedTask.value, fromOperator: props.operators.find(o => o.id === draggedTask.value.assigned_operator) })
  resetDrag()
}

const resetDrag = () => { dragOverOperator.value = null; dragOverColumn.value = null; draggedTask.value = null; draggedFromOperator.value = null }

const getPriorityClass = (task) => `priority-${task.work_order__priority || 'normal'}`
const getPriorityType = (p) => ({ low: 'info', normal: 'info', high: 'warning', urgent: 'danger' })[p] || 'info';
const getPriorityLabel = (p) => ({ low: '低', normal: '普通', high: '高', urgent: '紧急' })[p] || '普通';
const getStatusType = (s) => ({ draft: 'info', pending: 'warning', in_progress: 'primary', completed: 'success', cancelled: 'danger' })[s] || 'info';
const getStatusLabel = (s) => ({ draft: '草稿', pending: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消' })[s] || s;
</script>

<style scoped>
.task-drag-drop { display: flex; gap: 20px; overflow-x: auto; padding: 20px 0; min-height: 500px; }
.column { min-width: 300px; max-width: 350px; background: #f5f7fa; border-radius: 8px; display: flex; flex-direction: column; height: calc(100vh - 250px); min-height: 400px; border: 2px solid transparent; transition: all 0.3s; }
.column.drag-over { border-color: #409eff; background: #ecf5ff; border-style: dashed; }
.column-header { padding: 15px 20px; background: #fff; border-bottom: 2px solid #e4e7ed; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; }
.column-title { font-weight: bold; font-size: 16px; color: #303133; }
.column-content { flex: 1; padding: 15px; overflow-y: auto; }
.task-card { background: #fff; border-radius: 6px; padding: 12px; cursor: move; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-left: 4px solid #909399; }
.task-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.task-card.priority-urgent { border-left-color: #f56c6c; }
.task-card.priority-high { border-left-color: #e6a23c; }
.task-card.priority-normal { border-left-color: #409eff; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.card-title { font-weight: bold; font-size: 14px; color: #303133; flex: 1; }
.card-body { margin-bottom: 10px; }
.info-item { display: flex; align-items: center; font-size: 12px; color: #606266; margin-bottom: 6px; gap: 6px; }
.card-footer { border-top: 1px solid #f0f0f0; padding-top: 8px; }
.unassigned-column { background: #fef0f0; }
</style>
