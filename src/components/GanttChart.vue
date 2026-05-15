<template>
  <div class="gantt-chart">
    <div class="gantt-header">
      <div class="gantt-controls">
        <el-button-group>
          <el-button size="small" :disabled="scale <= SCALE_MIN" @click="zoomOut">
            <el-icon><ZoomOut /></el-icon> 缩小
          </el-button>
          <el-button size="small" @click="resetZoom">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
          <el-button size="small" :disabled="scale >= SCALE_MAX" @click="zoomIn">
            <el-icon><ZoomIn /></el-icon> 放大
          </el-button>
        </el-button-group>
        <el-button-group class="view-mode-group">
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
            <StatusTag :status="process.status" category="process" :label="process.status_display" size="small" />
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
import { StatusTag } from '@/components/common'

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

const SCALE_MIN = 0.5
const SCALE_MAX = 2
const SCALE_STEP = 0.25
const SCALE_DEFAULT = 1
const GANTT_DAY_WIDTH = 50

const scale = ref(SCALE_DEFAULT)
const viewMode = ref('day')
const dayWidth = ref(GANTT_DAY_WIDTH)

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
  scale.value = Math.min(scale.value + SCALE_STEP, SCALE_MAX)
}

const zoomOut = () => {
  scale.value = Math.max(scale.value - SCALE_STEP, SCALE_MIN)
}

const resetZoom = () => {
  scale.value = SCALE_DEFAULT
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.gantt-chart {
  width: 100%;
  overflow: hidden;
}

.gantt-header {
  padding: var(--ui-control-gap);
  border-bottom: 1px solid var(--ui-color-border);
}

.gantt-controls {
  display: flex;
  align-items: center;
  gap: var(--ui-control-gap);
  flex-wrap: wrap;
}

.view-mode-group {
  margin-left: 0;
}

.gantt-container {
  display: flex;
  overflow: auto;
}

.gantt-sidebar {
  width: var(--ui-chart-sidebar-width);
  flex-shrink: 0;
  border-right: 1px solid var(--ui-color-border);
}

.sidebar-header {
  display: flex;
  background-color: var(--ui-color-fill-light);
  border-bottom: 1px solid var(--ui-color-border);
  height: var(--ui-chart-header-height);
  align-items: center;
}

.header-cell {
  flex: 1;
  padding: 0 var(--ui-control-gap);
  font-weight: 700;
  font-size: var(--ui-font-size-sm);
}

.sidebar-row {
  display: flex;
  align-items: center;
  height: var(--ui-chart-row-height);
  border-bottom: 1px solid var(--ui-color-border);
}

.sidebar-row.row-active {
  background-color: var(--ui-color-primary-light);
}

.row-cell {
  flex: 1;
  padding: 0 var(--ui-control-gap);
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
  height: var(--ui-chart-header-height);
  background-color: var(--ui-color-fill-light);
  border-bottom: 1px solid var(--ui-color-border);
}

.timeline-cell {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--ui-color-border);
  font-size: var(--ui-font-size-xs);
}

.gantt-bars {
  position: relative;
}

.gantt-bar-row {
  height: var(--ui-chart-row-height);
  border-bottom: 1px solid var(--ui-color-border);
  position: relative;
}

.gantt-bar {
  position: absolute;
  height: var(--ui-chart-bar-height);
  top: var(--ui-chart-bar-offset-y);
  border-radius: var(--ui-radius-card);
  display: flex;
  align-items: center;
  padding: 0 var(--ui-control-gap);
  color: #fff;
  font-size: var(--ui-font-size-xs);
}

.gantt-bar.bar-pending {
  background-color: var(--ui-color-text-secondary);
}

.gantt-bar.bar-in_progress {
  background-color: var(--ui-color-warning);
}

.gantt-bar.bar-completed {
  background-color: var(--ui-color-success);
}

.gantt-bar.bar-cancelled {
  background-color: var(--ui-color-danger);
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
  margin-left: var(--ui-control-gap);
  opacity: 0.8;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .gantt-sidebar {
    width: min(72vw, var(--ui-chart-sidebar-width));
  }

  .gantt-controls :deep(.el-button-group) {
    display: flex;
  }
}
</style>
