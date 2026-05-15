<template>
  <div class="task-drag-drop">
    <div class="column unassigned-column" :class="{ 'drag-over': dragOverColumn === 'unassigned' }" @dragover.prevent @dragenter="dragOverColumn = 'unassigned'" @dragleave="dragOverColumn = null" @drop="handleDropUnassigned">
      <div class="column-header"><span class="column-title">待分派任务</span><el-badge :value="unassignedTasks.length" type="warning" /></div>
      <div class="column-content">
        <div v-for="task in unassignedTasks" :key="task.id" class="task-card" :class="getPriorityClass(task)" draggable="true" @dragstart="onDragStart(task, $event)">
          <div class="card-header"><div class="card-title">{{ task.work_content }}</div><StatusTag v-if="task.work_order__priority" :status="task.work_order__priority" category="priority" size="small" /></div>
          <div class="card-body"><div class="info-item"><el-icon><Document /></el-icon><span>{{ task.work_order__order_number || '-' }}</span></div><div class="info-item"><el-icon><Setting /></el-icon><span>{{ task.process_name || '-' }}</span></div><div class="info-item"><el-icon><Tickets /></el-icon><span>数量: {{ task.production_quantity }}</span></div></div>
          <div class="card-footer"><StatusTag :status="task.status" category="task" size="small" /></div>
        </div>
        <el-empty v-if="unassignedTasks.length === 0" description="暂无待分派任务" :image-size="80" />
      </div>
    </div>
    <div v-for="operator in operators" :key="operator.id" class="column operator-column" :class="{ 'drag-over': dragOverOperator === operator.id }" @drop="handleDropOperator(operator)" @dragover.prevent @dragenter="dragOverOperator = operator.id" @dragleave="dragOverOperator = null">
      <div class="column-header"><span class="column-title">{{ operator.name }}</span><el-badge :value="getOperatorTaskCount(operator.id)" type="primary" /></div>
      <div class="column-content">
        <div v-for="task in operatorTasks[operator.id] || []" :key="task.id" class="task-card" :class="getPriorityClass(task)" draggable="true" @dragstart="onDragStart(task, $event)">
          <div class="card-header"><div class="card-title">{{ task.work_content }}</div><StatusTag v-if="task.work_order__priority" :status="task.work_order__priority" category="priority" size="small" /></div>
          <div class="card-body"><div class="info-item"><el-icon><Document /></el-icon><span>{{ task.work_order__order_number || '-' }}</span></div><div class="info-item"><el-icon><Setting /></el-icon><span>{{ task.process_name || '-' }}</span></div></div>
          <div class="card-footer"><StatusTag :status="task.status" category="task" size="small" /></div>
        </div>
        <el-empty v-if="!operatorTasks[operator.id]?.length" description="暂无任务" :image-size="60" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Document, Setting, Tickets } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'

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
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.task-drag-drop { display: flex; gap: var(--ui-section-gap); overflow-x: auto; padding: var(--ui-section-gap) 0; min-height: var(--ui-board-column-min-height); }
.column { flex: 0 0 clamp(var(--ui-board-column-width-min), 32vw, var(--ui-board-column-width)); background: var(--ui-color-fill-light); border-radius: var(--ui-radius-card); display: flex; flex-direction: column; height: min(var(--ui-board-height), calc(100vh - var(--ui-board-height-offset))); min-height: var(--ui-board-column-min-height); border: 2px solid transparent; transition: all var(--ui-transition-base); }
.column.drag-over { border-color: var(--ui-color-primary); background: var(--ui-color-primary-light); border-style: dashed; }
.column-header { padding: var(--ui-stat-content-gap) var(--ui-section-gap); background: #fff; border-bottom: 2px solid var(--ui-color-border-strong); border-radius: var(--ui-radius-card) var(--ui-radius-card) 0 0; display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); }
.column-title { font-weight: 700; font-size: var(--ui-font-size-base); color: var(--ui-color-text-primary); }
.column-content { flex: 1; padding: var(--ui-stat-content-gap); overflow-y: auto; }
.task-card { background: #fff; border-radius: var(--ui-radius-card); padding: var(--ui-stat-content-gap); cursor: move; transition: all var(--ui-transition-base); box-shadow: var(--ui-board-card-shadow); border-left: var(--ui-board-priority-border-width) solid var(--ui-color-text-secondary); }
.task-card:hover { transform: translateY(var(--ui-board-card-lift)); box-shadow: var(--ui-board-card-shadow-hover); }
.task-card.priority-urgent { border-left-color: var(--ui-color-danger); }
.task-card.priority-high { border-left-color: var(--ui-color-warning); }
.task-card.priority-normal { border-left-color: var(--ui-color-primary); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--ui-control-gap); gap: var(--ui-control-gap); }
.card-title { font-weight: 700; font-size: var(--ui-font-size-sm); color: var(--ui-color-text-primary); flex: 1; min-width: 0; }
.card-body { margin-bottom: var(--ui-control-gap); }
.info-item { display: flex; align-items: center; font-size: var(--ui-font-size-xs); color: var(--ui-color-text-regular); margin-bottom: var(--ui-inline-gap); gap: var(--ui-inline-gap); }
.card-footer { border-top: 1px solid var(--ui-color-border); padding-top: var(--ui-compact-padding-x); }
.unassigned-column { background: var(--ui-color-danger-light); }

@media (max-width: bp.$breakpoint-phone-max) {
  .task-drag-drop {
    gap: var(--ui-control-gap);
    min-height: 0;
  }

  .column {
    flex-basis: min(var(--ui-board-column-mobile-ratio), var(--ui-board-column-width-mobile));
    height: min(var(--ui-board-mobile-height), calc(100vh - var(--ui-board-mobile-height-offset)));
  }
}
</style>
