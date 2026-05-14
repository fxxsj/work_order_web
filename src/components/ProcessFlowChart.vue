<template>
  <div class="process-flow-chart">
    <div v-if="processes && processes.length > 0" class="flow-container">
      <div
        v-for="(process, index) in sortedProcesses"
        :key="process.id"
        class="flow-item"
      >
        <!-- 连接线 -->
        <div
          v-if="index > 0"
          class="flow-connector"
          :class="{
            'connector-completed': isProcessCompleted(processes[index - 1]),
            'connector-active': isProcessActive(processes[index - 1])
          }"
        ></div>

        <!-- 工序节点 -->
        <div
          class="process-node"
          :class="{
            'node-pending': process.status === 'pending',
            'node-in-progress': process.status === 'in_progress',
            'node-completed': process.status === 'completed',
            'node-skipped': process.status === 'skipped',
            'node-parallel': isParallelProcess(process)
          }"
          @click="handleProcessClick(process)"
        >
          <div class="node-icon">
            <el-icon>
              <Clock v-if="process.status === 'pending'" />
              <Loading v-else-if="process.status === 'in_progress'" />
              <CircleCheck v-else-if="process.status === 'completed'" />
              <CircleClose v-else />
            </el-icon>
          </div>
          <div class="node-content">
            <div class="node-name">
              {{ process.process_name }}
            </div>
            <div class="node-status">
              <el-tag
                :type="getStatusTagType(process.status)"
                size="small"
              >
                {{ getStatusDisplay(process.status) }}
              </el-tag>
            </div>
            <div v-if="process.department_name" class="node-department">
              <el-icon><OfficeBuilding /></el-icon>
              <span>{{ process.department_name }}</span>
            </div>
          </div>
          <div class="node-arrow" v-if="index < sortedProcesses.length - 1">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无工序数据" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Clock, Loading, CircleCheck, CircleClose, OfficeBuilding, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  processes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['process-click'])

const sortedProcesses = computed(() => {
  return [...props.processes].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
})

const isProcessCompleted = (process) => process.status === 'completed'
const isProcessActive = (process) => process.status === 'in_progress'
const isParallelProcess = (process) => process.is_parallel || false

const handleProcessClick = (process) => {
  emit('process-click', process)
}

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    skipped: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusDisplay = (status) => {
  const displayMap = {
    pending: '待开始',
    in_progress: '进行中',
    completed: '已完成',
    skipped: '已跳过'
  }
  return displayMap[status] || status
}
</script>

<style scoped>
.process-flow-chart {
  padding: 20px;
}

.flow-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
}

.flow-item {
  display: flex;
  align-items: center;
}

.flow-connector {
  width: 40px;
  height: 2px;
  background-color: #dcdfe6;
  margin: 0 10px;
}

.flow-connector.connector-completed {
  background-color: #67c23a;
}

.flow-connector.connector-active {
  background-color: #e6a23c;
}

.process-node {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
}

.process-node:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.node-pending {
  border-color: #909399;
}

.node-in-progress {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

.node-completed {
  border-color: #67c23a;
  background-color: #f0f9eb;
}

.node-skipped {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.node-parallel {
  border-style: dashed;
}

.node-icon {
  font-size: 24px;
  margin-right: 15px;
}

.node-pending .node-icon {
  color: #909399;
}

.node-in-progress .node-icon {
  color: #e6a23c;
}

.node-completed .node-icon {
  color: #67c23a;
}

.node-skipped .node-icon {
  color: #f56c6c;
}

.node-content {
  flex: 1;
}

.node-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 5px;
}

.node-status {
  margin-bottom: 5px;
}

.node-department {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.node-arrow {
  margin-left: 15px;
  color: #c0c4cc;
}
</style>
