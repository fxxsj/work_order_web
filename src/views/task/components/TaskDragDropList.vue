<template>
  <div class="flex gap-6 overflow-x-auto py-4">
    <div class="flex min-w-0 flex-col rounded-xl bg-danger-50 dark:bg-danger-900/20" :class="{ 'border-2 border-dashed border-danger-500': dragOverColumn === 'unassigned' }" style="width: 280px; min-height: 400px;" @dragover.prevent @dragenter="dragOverColumn = 'unassigned'" @dragleave="dragOverColumn = null" @drop="handleDropUnassigned">
      <div class="flex items-center justify-between border-b-2 border-gray-200 p-4 dark:border-dark-700"><span class="font-bold">待分派任务</span><span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400">{ unassignedTasks.length }</span></div>
      <div class="flex-1 overflow-y-auto p-4">
        <div v-for="task in unassignedTasks" :key="task.id" class="mb-3 cursor-move rounded-lg bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md" :class="getPriorityClass(task)" draggable="true" @dragstart="onDragStart(task, $event)">
          <div class="mb-2 flex items-start justify-between gap-2"><div class="flex-1 truncate font-bold text-sm">{{ task.work_content }}</div><StatusTag v-if="task.work_order__priority" :status="task.work_order__priority" category="priority" size="small" /></div>
          <div class="mb-2 flex items-center gap-2 text-xs text-gray-400"><Icon name="document" class="h-3 w-3" /><span>{{ task.work_order__order_number || '-' }}</span></div>
          <div class="mb-2 flex items-center gap-2 text-xs text-gray-400"><Icon name="cog" class="h-3 w-3" /><span>{{ task.process_name || '-' }}</span></div>
          <div class="mb-2 flex items-center gap-2 text-xs text-gray-400"><Icon name="list" class="h-3 w-3" /><span>数量: {{ task.production_quantity }}</span></div>
          <div class="border-t border-gray-100 pt-2"><StatusTag :status="task.status" category="task" size="small" /></div>
        </div>
        <EmptyState v-if="unassignedTasks.length === 0" description="暂无待分派任务" />
      </div>
    </div>
    <div v-for="operator in operators" :key="operator.id" class="flex min-w-0 flex-col rounded-xl bg-gray-50 dark:bg-dark-700" :class="{ 'border-2 border-dashed border-primary-500': dragOverOperator === operator.id }" style="width: 280px; min-height: 400px;" @drop="handleDropOperator(operator)" @dragover.prevent @dragenter="dragOverOperator = operator.id" @dragleave="dragOverOperator = null">
      <div class="flex items-center justify-between border-b-2 border-gray-200 p-4 dark:border-dark-600"><span class="font-bold">{{ operator.name }}</span><span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{ getOperatorTaskCount(operator.id) }</span></div>
      <div class="flex-1 overflow-y-auto p-4">
        <div v-for="task in (operatorTasks as any)[operator.id] || []" :key="task.id" class="mb-3 cursor-move rounded-lg bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md" :class="getPriorityClass(task)" draggable="true" @dragstart="onDragStart(task, $event)">
          <div class="mb-2 flex items-start justify-between gap-2"><div class="flex-1 truncate font-bold text-sm">{{ task.work_content }}</div><StatusTag v-if="task.work_order__priority" :status="task.work_order__priority" category="priority" size="small" /></div>
          <div class="mb-2 flex items-center gap-2 text-xs text-gray-400"><Icon name="document" class="h-3 w-3" /><span>{{ task.work_order__order_number || '-' }}</span></div>
          <div class="mb-2 flex items-center gap-2 text-xs text-gray-400"><Icon name="cog" class="h-3 w-3" /><span>{{ task.process_name || '-' }}</span></div>
          <div class="border-t border-gray-100 pt-2"><StatusTag :status="task.status" category="task" size="small" /></div>
        </div>
        <EmptyState v-if="!(operatorTasks as any)[operator.id]?.length" description="暂无任务" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Icon } from '@/components/common'
import { StatusTag, EmptyState } from '@/components/common'

const props = defineProps({ tasks: { type: Array as any, default: () => [] }, operators: { type: Array as any, default: () => [] } })
const emit = defineEmits(['task-assigned', 'task-reassigned', 'task-unassigned'])

const unassignedTasks = ref<any[]>([])
const operatorTasks = ref({})
const dragOverOperator = ref<any>(null)
const dragOverColumn = ref<any>(null)
const draggedTask = ref<any>(null)
const draggedFromOperator = ref(null)

watch(() => props.tasks, () => organizeTasks(), { immediate: true, deep: true })
watch(() => props.operators, () => initializeOperatorTasks(), { immediate: true, deep: true })

const organizeTasks = () => {
  unassignedTasks.value = props.tasks.filter((t: any) => !t.assigned_operator && t.status !== 'completed')
  props.operators.forEach((op: any) => { if (!(operatorTasks.value as any)[op.id]) (operatorTasks.value as any)[op.id] = []; (operatorTasks.value as any)[op.id] = props.tasks.filter((t: any) => t.assigned_operator === op.id) })
}

const initializeOperatorTasks = () => { props.operators.forEach((op: any) => { if (!(operatorTasks.value as any)[op.id]) (operatorTasks.value as any)[op.id] = [] }) }
const getOperatorTaskCount = (id: any) => (operatorTasks.value as any)[id]?.length || 0

const onDragStart = (task: any, event: any) => { draggedTask.value = task; draggedFromOperator.value = task.assigned_operator; event.dataTransfer.effectAllowed = 'move' }

const handleDropOperator = (operator: any) => {
  if (!draggedTask.value) return
  if (draggedTask.value.assigned_operator === operator.id) return
  if (draggedFromOperator.value) emit('task-reassigned', { task: draggedTask.value, fromOperator: props.operators.find((o: any) => o.id === draggedFromOperator.value), toOperator: operator })
  else emit('task-assigned', { task: draggedTask.value, operator })
  resetDrag()
}

const handleDropUnassigned = () => {
  if (!draggedTask.value || !draggedTask.value.assigned_operator) return
  emit('task-unassigned', { task: draggedTask.value, fromOperator: props.operators.find((o: any) => o.id === draggedTask.value.assigned_operator) })
  resetDrag()
}

const resetDrag = () => { dragOverOperator.value = null; dragOverColumn.value = null; draggedTask.value = null; draggedFromOperator.value = null }

const getPriorityClass = (task: any) => {
  const p = task.work_order__priority || 'normal'
  return ({ urgent: 'border-l-4 border-l-danger-500', high: 'border-l-4 border-l-warning-500', normal: 'border-l-4 border-l-primary-500', low: 'border-l-4 border-l-gray-400' } as any)[p] || ''
}
</script>