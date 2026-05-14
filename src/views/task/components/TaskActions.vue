<template>
  <div class="task-actions">
    <el-button v-if="canComplete" type="success" size="small" @click="emit('complete', task)">完成</el-button>
    <span v-else-if="task.status !== 'completed'" style="color: #909399; font-size: 12px;">{{ blockReason }}</span>
    <el-button v-if="task.status !== 'completed' && !task.auto_calculate_quantity" type="primary" size="small" @click="emit('update', task)">更新</el-button>
    <el-button type="warning" size="small" @click="emit('assign', task)">分派</el-button>
    <el-button v-if="task.status !== 'completed' && !task.is_subtask && !task.subtasks_count" type="info" size="small" @click="emit('split', task)">拆分</el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['complete', 'update', 'assign', 'split'])

const canComplete = computed(() => props.task.status !== 'completed')
const blockReason = computed(() => '')
</script>

<style scoped>
.task-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
}

.task-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
</style>
