<template>
  <div class="process-list">
    <div class="card card-hover process-list-card">
      <div class="card-header">
        <span class="card-title">工序列表</span>
        <span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{{ processes.length }}</span>
      </div>
      <div class="card-body">

      <EmptyState
        v-if="!loading && processes.length === 0"
        title="暂无工序数据"
      />

      <div v-else class="process-items">
        <div
          v-for="process in displayProcesses"
          :key="process.id"
          class="process-item"
          :class="{ 'is-selected': isSelected(process) }"
          @click="handleSelect(process)"
        >
          <div class="process-main">
            <div class="process-name">
              {{ process.name }}
            </div>
            <div class="process-code">
              {{ process.code }}
            </div>
          </div>
          <Icon v-if="isSelected(process)" name="check" class="selected-icon" />
        </div>

        <div v-if="loading" class="space-y-3 mt-4">
          <div v-for="i in 5" :key="i" class="h-8 animate-pulse rounded bg-gray-200 dark:bg-dark-600" />
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'

const props = defineProps({
  processes: { type: Array as any, default: () => [] },
  selectedId: { type: [Number, String], default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const displayProcesses = computed(() => props.processes)

const isSelected = (process: any) => process.id === props.selectedId

const handleSelect = (process: any) => {
  emit('select', process)
}
</script>

<style>
.process-list {
  padding: 20px;
}

.process-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 500;
  font-size: 16px;
}

.process-items {
  max-height: 500px;
  overflow-y: auto;
}

.process-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.process-item:hover {
  background-color: #f5f7fa;
}

.process-item.is-selected {
  background-color: #ecf5ff;
  border-left: 3px solid #409eff;
}

.process-main {
  flex: 1;
}

.process-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.process-code {
  font-size: 12px;
  color: #909399;
}

.selected-icon {
  color: #409eff;
  font-size: 16px;
}
</style>
