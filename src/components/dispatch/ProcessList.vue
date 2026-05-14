<template>
  <div class="process-list">
    <el-card class="process-list-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">工序列表</span>
          <el-badge :value="processes.length" class="badge" type="primary" />
        </div>
      </template>

      <el-empty
        v-if="!loading && processes.length === 0"
        description="暂无工序数据"
        :image-size="100"
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
          <el-icon v-if="isSelected(process)" class="selected-icon"><Check /></el-icon>
        </div>

        <el-skeleton
          v-if="loading"
          :rows="5"
          animated
          style="margin-top: 16px;"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Check } from '@element-plus/icons-vue'

const props = defineProps({
  processes: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: [Number, String],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const displayProcesses = computed(() => props.processes)

const isSelected = (process) => process.id === props.selectedId

const handleSelect = (process) => {
  emit('select', process)
}
</script>

<style scoped>
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
