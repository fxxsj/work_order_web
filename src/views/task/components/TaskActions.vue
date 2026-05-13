<template>
  <div>
    <el-button v-if="canComplete" type="success" size="small" @click="emit('complete', task)">完成</el-button>
    <span v-else-if="task.status !== 'completed'" style="color: #909399; font-size: 12px;">{{ blockReason }}</span>
    <el-button v-if="task.status !== 'completed' && !task.auto_calculate_quantity" type="primary" size="small" style="margin-left: 5px;" @click="emit('update', task)">更新</el-button>
    <el-button type="warning" size="small" style="margin-left: 5px;" @click="emit('assign', task)">分派</el-button>
    <el-button v-if="task.status !== 'completed' && !task.is_subtask && !task.subtasks_count" type="info" size="small" style="margin-left: 5px;" @click="emit('split', task)">拆分</el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['complete', 'update', 'assign', 'split'])

const canComplete = computed(() => props.task.status !== 'completed')
const blockReason = computed(() => '')
</script>
