<template>
  <div class="task-board-view">
    <el-row :gutter="20">
      <el-col :span="8"><task-column status="pending" title="待开始" :tasks="tasksByStatus.pending" :editable="editable" :loading="loading" @task-click="handleTaskClick" @task-update="handleTaskUpdate" @task-assign="handleTaskAssign" @task-complete="handleTaskComplete" /></el-col>
      <el-col :span="8"><task-column status="in_progress" title="进行中" :tasks="tasksByStatus.in_progress" :editable="editable" :loading="loading" @task-click="handleTaskClick" @task-update="handleTaskUpdate" @task-assign="handleTaskAssign" @task-complete="handleTaskComplete" /></el-col>
      <el-col :span="8"><task-column status="completed" title="已完成" :tasks="tasksByStatus.completed" :editable="editable" :loading="loading" @task-click="handleTaskClick" @task-update="handleTaskUpdate" @task-assign="handleTaskAssign" @task-complete="handleTaskComplete" /></el-col>
    </el-row>
  </div>
</template>

<script setup>
import TaskColumn from './TaskColumn.vue'

defineProps({ tasksByStatus: { type: Object, required: true }, editable: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['task-click', 'task-update', 'task-assign', 'task-complete'])
const handleTaskClick = (t) => emit('task-click', t)
const handleTaskUpdate = (t) => emit('task-update', t)
const handleTaskAssign = (t) => emit('task-assign', t)
const handleTaskComplete = (t) => emit('task-complete', t)
</script>

<style scoped>
.task-board-view { margin-top: 20px; }
</style>
