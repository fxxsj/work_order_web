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
            <Icon :name="getProcessIcon(process.status)" />
          </div>
          <div class="node-content">
            <div class="node-name">
              {{ process.process_name }}
            </div>
            <div class="node-status">
              <StatusTag :status="process.status" category="process" :label="process.status_display" size="small" />
            </div>
            <div v-if="process.department_name" class="node-department">
              <Icon name="building" class="h-4 w-4" />
              <span>{{ process.department_name }}</span>
            </div>
          </div>
          <div class="node-arrow" v-if="index < sortedProcesses.length - 1">
            <Icon name="arrowRight" class="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else title="暂无工序数据" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag } from '@/components/common'

const props = defineProps({
  processes: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['process-click'])

const sortedProcesses = computed(() => {
  return [...props.processes].sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
})

const isProcessCompleted = (process: any) => process.status === 'completed'
const isProcessActive = (process: any) => process.status === 'in_progress'
const isParallelProcess = (process: any) => process.is_parallel || false

const handleProcessClick = (process: any) => {
  emit('process-click', process)
}

const getProcessIcon = (status: any) => {
  const map = {
    pending: 'clock',
    in_progress: 'loading',
    completed: 'checkCircle'
  }
  return (map as any)[status] || 'xCircle'
}

</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.process-flow-chart {
  padding: var(--ui-section-gap);
}

.flow-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  row-gap: var(--ui-section-gap);
}

.flow-item {
  display: flex;
  align-items: center;
}

.flow-connector {
  width: var(--ui-flow-connector-width);
  height: var(--ui-flow-connector-height);
  background-color: var(--ui-color-border-strong);
  margin: 0 var(--ui-control-gap);
}

.flow-connector.connector-completed {
  background-color: var(--ui-color-success);
}

.flow-connector.connector-active {
  background-color: var(--ui-color-warning);
}

.process-node {
  display: flex;
  align-items: center;
  padding: var(--ui-stat-content-gap) var(--ui-section-gap);
  border: var(--ui-flow-node-border-width) solid var(--ui-color-border-strong);
  border-radius: var(--ui-radius-card);
  cursor: pointer;
  transition: all var(--ui-transition-base);
  background-color: #fff;
  min-height: var(--ui-touch-target-min);
}

.process-node:hover {
  box-shadow: var(--ui-shadow-card);
}

.node-pending {
  border-color: var(--ui-color-text-secondary);
}

.node-in-progress {
  border-color: var(--ui-color-warning);
  background-color: var(--ui-color-warning-light);
}

.node-completed {
  border-color: var(--ui-color-success);
  background-color: var(--ui-color-success-light);
}

.node-skipped {
  border-color: var(--ui-color-danger);
  background-color: var(--ui-color-danger-light);
}

.node-parallel {
  border-style: dashed;
}

.node-icon {
  font-size: var(--ui-stat-icon-font-size);
  margin-right: var(--ui-stat-content-gap);
}

.node-pending .node-icon {
  color: var(--ui-color-text-secondary);
}

.node-in-progress .node-icon {
  color: var(--ui-color-warning);
}

.node-completed .node-icon {
  color: var(--ui-color-success);
}

.node-skipped .node-icon {
  color: var(--ui-color-danger);
}

.node-content {
  flex: 1;
}

.node-name {
  font-weight: 500;
  font-size: var(--ui-font-size-sm);
  margin-bottom: var(--ui-inline-gap);
}

.node-status {
  margin-bottom: var(--ui-inline-gap);
}

.node-department {
  font-size: var(--ui-font-size-xs);
  color: var(--ui-color-text-secondary);
  display: flex;
  align-items: center;
  gap: var(--ui-inline-gap);
}

.node-arrow {
  margin-left: var(--ui-stat-content-gap);
  color: var(--ui-color-border-strong);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .flow-container {
    flex-direction: column;
    gap: var(--ui-control-gap);
  }

  .flow-item {
    align-items: stretch;
    flex-direction: column;
  }

  .flow-connector {
    width: var(--ui-flow-connector-height);
    height: var(--ui-section-gap);
    margin: var(--ui-inline-gap) var(--ui-section-gap);
  }

  .process-node {
    width: 100%;
  }

  .node-arrow {
    display: none;
  }
}
</style>
