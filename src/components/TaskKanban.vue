<template>
  <div class="task-kanban">
    <div class="kanban-container">
      <div
        v-for="column in columns"
        :key="column.status"
        class="kanban-column"
      >
        <div class="column-header">
          <span class="column-title">{{ column.title }}</span>
          <el-badge :value="column.tasks.length" class="column-badge" />
        </div>
        <div
          class="column-content"
          :class="`column-${column.status}`"
        >
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="kanban-card"
            @click="handleTaskClick(task)"
          >
            <div class="card-header">
              <div class="card-title">
                {{ task.work_content }}
              </div>
              <StatusTag :status="task.task_type" category="taskType" :label="task.task_type_display" size="small" />
            </div>
            <div class="card-body">
              <div class="card-info">
                <div class="info-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ task.work_order_number || '-' }}</span>
                </div>
                <div v-if="task.assigned_department_name" class="info-item">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>{{ task.assigned_department_name }}</span>
                </div>
                <div v-if="task.assigned_operator_name" class="info-item">
                  <el-icon><User /></el-icon>
                  <span>{{ task.assigned_operator_name }}</span>
                </div>
              </div>
              <div v-if="task.production_quantity > 0" class="card-progress">
                <div class="progress-info">
                  <span>进度: {{ getProgressPercentage(task) }}%</span>
                  <span>{{ task.quantity_completed || 0 }}/{{ task.production_quantity }}</span>
                </div>
                <el-progress
                  :percentage="getProgressPercentage(task)"
                  :status="getProgressStatus(task)"
                  :stroke-width="6"
                />
              </div>
            </div>
            <div class="card-footer">
              <div class="footer-left">
                <StatusTag
                  v-if="task.priority"
                  :status="task.priority"
                  category="priority"
                  :label="task.priority_display"
                  size="small"
                  effect="plain"
                />
              </div>
              <div class="footer-right">
                <span class="deadline" :class="{ 'deadline-overdue': isOverdue(task) }">
                  <el-icon><Clock /></el-icon>
                  {{ formatDate(task.deadline) }}
                </span>
              </div>
            </div>
          </div>
          <el-empty v-if="column.tasks.length === 0" description="暂无任务" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document, OfficeBuilding, User, Clock } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['task-click'])

const columns = computed(() => {
  const statusMap = {
    pending: { title: '待开始', status: 'pending' },
    in_progress: { title: '进行中', status: 'in_progress' },
    completed: { title: '已完成', status: 'completed' }
  }

  return Object.values(statusMap).map(col => ({
    ...col,
    tasks: props.tasks.filter(task => task.status === col.status)
  }))
})

const handleTaskClick = (task) => {
  emit('task-click', task)
}

const getProgressPercentage = (task) => {
  if (!task.production_quantity) return 0
  return Math.round(((task.quantity_completed || 0) / task.production_quantity) * 100)
}

const getProgressStatus = (task) => {
  const percentage = getProgressPercentage(task)
  if (percentage >= 100) return 'success'
  if (percentage >= 80) return 'warning'
  return ''
}

const isOverdue = (task) => {
  if (!task.deadline) return false
  return new Date(task.deadline) < new Date() && task.status !== 'completed'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.task-kanban {
  padding: var(--ui-page-padding);
}

.kanban-container {
  display: flex;
  gap: var(--ui-section-gap);
  overflow-x: auto;
}

.kanban-column {
  flex: 1 0 clamp(var(--ui-board-column-width-min), 32vw, var(--ui-board-column-width));
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ui-control-gap) var(--ui-stat-content-gap);
  background-color: var(--ui-color-fill-light);
  border-radius: var(--ui-radius-card) var(--ui-radius-card) 0 0;
  border-bottom: 2px solid var(--ui-color-border-strong);
}

.column-title {
  font-weight: 500;
  font-size: var(--ui-font-size-base);
}

.column-content {
  background-color: var(--ui-color-fill-light);
  min-height: var(--ui-board-kanban-min-height);
  padding: var(--ui-control-gap);
  border-radius: 0 0 var(--ui-radius-card) var(--ui-radius-card);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .kanban-column {
    flex-basis: min(var(--ui-board-column-mobile-ratio), var(--ui-board-column-width-mobile));
  }
}

.kanban-card {
  background-color: #fff;
  border-radius: var(--ui-radius-card);
  padding: var(--ui-stat-content-gap);
  margin-bottom: var(--ui-control-gap);
  cursor: pointer;
  transition: all var(--ui-transition-base);
  box-shadow: var(--ui-board-card-shadow);
}

.kanban-card:hover {
  box-shadow: var(--ui-board-card-shadow-hover);
  transform: translateY(var(--ui-board-card-lift));
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--ui-control-gap);
  gap: var(--ui-control-gap);
}

.card-title {
  font-weight: 500;
  font-size: var(--ui-font-size-sm);
  flex: 1;
  min-width: 0;
}

.card-body {
  margin-bottom: var(--ui-control-gap);
}

.card-info {
  margin-bottom: var(--ui-control-gap);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--ui-inline-gap);
  font-size: var(--ui-font-size-xs);
  color: var(--ui-color-text-regular);
  margin-bottom: var(--ui-inline-gap);
}

.card-progress {
  margin-top: var(--ui-control-gap);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--ui-font-size-xs);
  color: var(--ui-color-text-regular);
  margin-bottom: var(--ui-inline-gap);
  gap: var(--ui-control-gap);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ui-control-gap);
  padding-top: var(--ui-control-gap);
  border-top: 1px solid var(--ui-color-border);
}

.deadline {
  font-size: var(--ui-font-size-xs);
  color: var(--ui-color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--ui-inline-gap);
}

.deadline-overdue {
  color: var(--ui-color-danger);
}
</style>
