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
              <el-tag
                :type="getTaskTypeTagType(task.task_type)"
                size="small"
              >
                {{ getTaskTypeDisplay(task.task_type) }}
              </el-tag>
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
                <el-tag
                  v-if="task.priority"
                  :type="getPriorityType(task.priority)"
                  size="small"
                  effect="plain"
                >
                  {{ getPriorityDisplay(task.priority) }}
                </el-tag>
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

const getTaskTypeTagType = (type) => {
  const typeMap = {
    plate_making: 'success',
    cutting: 'info',
    printing: 'primary',
    foiling: 'warning',
    embossing: 'warning',
    die_cutting: 'warning',
    packaging: 'info',
    general: 'info'
  }
  return typeMap[type] || 'info'
}

const getTaskTypeDisplay = (type) => {
  const displayMap = {
    plate_making: '制版',
    cutting: '裁切',
    printing: '印刷',
    foiling: '烫金',
    embossing: '击凸',
    die_cutting: '模切',
    packaging: '包装',
    general: '通用'
  }
  return displayMap[type] || type
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

const getPriorityType = (priority) => {
  const typeMap = {
    low: 'info',
    normal: 'success',
    high: 'warning',
    urgent: 'danger'
  }
  return typeMap[priority] || 'info'
}

const getPriorityDisplay = (priority) => {
  const displayMap = {
    low: '低',
    normal: '普通',
    high: '高',
    urgent: '紧急'
  }
  return displayMap[priority] || priority
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

<style scoped>
.task-kanban {
  padding: 20px;
}

.kanban-container {
  display: flex;
  gap: 20px;
  overflow-x: auto;
}

.kanban-column {
  min-width: 300px;
  max-width: 350px;
  flex: 1;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 8px 8px 0 0;
  border-bottom: 2px solid #e4e7ed;
}

.column-title {
  font-weight: 500;
  font-size: 16px;
}

.column-content {
  background-color: #f5f7fa;
  min-height: 200px;
  padding: 10px;
  border-radius: 0 0 8px 8px;
}

.kanban-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.kanban-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.card-title {
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  margin-right: 10px;
}

.card-body {
  margin-bottom: 10px;
}

.card-info {
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.card-progress {
  margin-top: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.deadline {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.deadline-overdue {
  color: #f56c6c;
}
</style>
