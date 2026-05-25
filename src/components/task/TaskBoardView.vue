<template>
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <task-column
      status="pending"
      title="待开始"
      :tasks="tasksByStatus.pending"
      :editable="editable"
      :loading="loading"
      @task-click="handleTaskClick"
      @task-update="handleTaskUpdate"
      @task-assign="handleTaskAssign"
      @task-complete="handleTaskComplete"
    />
    <task-column
      status="in_progress"
      title="进行中"
      :tasks="tasksByStatus.in_progress"
      :editable="editable"
      :loading="loading"
      @task-click="handleTaskClick"
      @task-update="handleTaskUpdate"
      @task-assign="handleTaskAssign"
      @task-complete="handleTaskComplete"
    />
    <task-column
      status="completed"
      title="已完成"
      :tasks="tasksByStatus.completed"
      :editable="editable"
      :loading="loading"
      @task-click="handleTaskClick"
      @task-update="handleTaskUpdate"
      @task-assign="handleTaskAssign"
      @task-complete="handleTaskComplete"
    />
  </div>
</template>

<script setup lang="ts">
import TaskColumn from './TaskColumn.vue'

defineProps({ tasksByStatus: { type: Object, required: true }, editable: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['task-click', 'task-update', 'task-assign', 'task-complete'])
const handleTaskClick = (t: any) => emit('task-click', t)
const handleTaskUpdate = (t: any) => emit('task-update', t)
const handleTaskAssign = (t: any) => emit('task-assign', t)
const handleTaskComplete = (t: any) => emit('task-complete', t)
</script>