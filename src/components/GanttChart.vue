<template>
  <div class="gantt-chart">
    <div class="gantt-header">
      <div class="gantt-controls">
        <el-button-group>
          <el-button size="small" :disabled="scale <= 0.5" @click="zoomOut">
            <el-icon><ZoomOut /></el-icon> 缩小
          </el-button>
          <el-button size="small" @click="resetZoom">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button size="small" :disabled="scale >= 2" @click="zoomIn">
            <el-icon><ZoomIn /></el-icon> 放大
          </el-button>
        </el-button-group>
        <el-button-group style="margin-left: 10px;">
          <el-button size="small" :type="viewMode === 'day' ? 'primary' : ''" @click="viewMode = 'day'">
            日视图
          </el-button>
          <el-button size="small" :type="viewMode === 'week' ? 'primary' : ''" @click="viewMode = 'week'">
            周视图
          </el-button>
          <el-button size="small" :type="viewMode === 'month' ? 'primary' : ''" @click="viewMode = 'month'">
            月视图
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div ref="ganttContainer" class="gantt-container">
      <!-- 左侧工序列表 -->
      <div class="gantt-sidebar">
        <div class="sidebar-header">
          <div class="header-cell">
            工序
          </div>
          <div class="header-cell">
            状态
          </div>
          <div class="header-cell">
            部门
          </div>
        </div>
        <div
          v-for="process in sortedProcesses"
          :key="process.id"
          class="sidebar-row"
          :class="{ 'row-active': process.status === 'in_progress' }"
        >
          <div class="row-cell process-name">
            {{ process.name }}
          </div>
          <div class="row-cell">
            <el-tag :type="getStatusType(process.status)" size="small">
              {{ process.status_display }}
            </el-tag>
          </div>
          <div class="row-cell">
            {{ process.department_name || '-' }}
          </div>
        </div>
      </div>

      <!-- 右侧甘特图 -->
      <div class="gantt-body">
        <div class="gantt-timeline">
          <div
            v-for="date in timelineDates"
            :key="date"
            class="timeline-cell"
            :style="{ width: `${dayWidth * scale}px` }"
          >
            {{ formatDate(date) }}
          </div>
        </div>
        <div class="gantt-bars">
          <div
            v-for="process in sortedProcesses"
            :key="process.id"
            class="gantt-bar-row"
          >
            <div
              v-if="process.start_date && process.end_date"
              class="gantt-bar"
              :class="`bar-${process.status}`"
              :style="getBarStyle(process)"
            >
              <div class="bar-content">
                <span class="bar-label">{{ process.name }}</span>
                <span class="bar-duration">{{ getDuration(process) }}天</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ZoomOut, ZoomIn, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  processes: {
    type: Array,
    default: () => []
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  }
})

const scale = ref(1)
const viewMode = ref('day')
const dayWidth = ref(50)

const sortedProcesses = computed(() => {
  return [...props.processes].sort((a, b) => {
    if (a.start_date && b.start_date) {
      return new Date(a.start_date) - new Date(b.start_date)
    }
    return 0
  })
})

const timelineDates = computed(() => {
  const dates = []
  const start = props.startDate ? new Date(props.startDate) : new Date()
  const end = props.endDate ? new Date(props.endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d).toISOString().split('T')[0])
  }
  
  return dates
})

const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getBarStyle = (process) => {
  const start = new Date(process.start_date)
  const end = new Date(process.end_date)
  const timelineStart = props.startDate ? new Date(props.startDate) : new Date()
  
  const offsetDays = Math.floor((start - timelineStart) / (1000 * 60 * 60 * 24))
  const durationDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
  
  return {
    left: `${offsetDays * dayWidth.value * scale.value}px`,
    width: `${durationDays * dayWidth.value * scale.value}px`
  }
}

const getDuration = (process) => {
  const start = new Date(process.start_date)
  const end = new Date(process.end_date)
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const zoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 2)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5)
}

const resetZoom = () => {
  scale.value = 1
}
</script>

<style scoped>
.gantt-chart {
  width: 100%;
  overflow: hidden;
}

.gantt-header {
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.gantt-controls {
  display: flex;
  align-items: center;
}

.gantt-container {
  display: flex;
  overflow: auto;
}

.gantt-sidebar {
  width: 300px;
  flex-shrink: 0;
  border-right: 1px solid #ebeef5;
}

.sidebar-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  height: 40px;
  align-items: center;
}

.header-cell {
  flex: 1;
  padding: 0 10px;
  font-weight: bold;
  font-size: 14px;
}

.sidebar-row {
  display: flex;
  align-items: center;
  height: 50px;
  border-bottom: 1px solid #ebeef5;
}

.sidebar-row.row-active {
  background-color: #ecf5ff;
}

.row-cell {
  flex: 1;
  padding: 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gantt-body {
  flex: 1;
  overflow: auto;
}

.gantt-timeline {
  display: flex;
  height: 40px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
}

.timeline-cell {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ebeef5;
  font-size: 12px;
}

.gantt-bars {
  position: relative;
}

.gantt-bar-row {
  height: 50px;
  border-bottom: 1px solid #ebeef5;
  position: relative;
}

.gantt-bar {
  position: absolute;
  height: 30px;
  top: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: #fff;
  font-size: 12px;
}

.gantt-bar.bar-pending {
  background-color: #909399;
}

.gantt-bar.bar-in_progress {
  background-color: #e6a23c;
}

.gantt-bar.bar-completed {
  background-color: #67c23a;
}

.gantt-bar.bar-cancelled {
  background-color: #f56c6c;
}

.bar-content {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.bar-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-duration {
  margin-left: 10px;
  opacity: 0.8;
}
</style>
