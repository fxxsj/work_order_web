<template>
  <el-card>
    <template #header><div class="card-header"><span>工序信息</span><el-button v-if="editable" type="primary" size="small" :icon="Plus" @click="emit('add-process')">添加工序</el-button></div></template>
    <div v-for="process in processes" :key="process.id" class="process-item" :style="{ borderLeftColor: getProcessColor(process.status) }">
      <el-card>
        <template #header><div class="process-header"><div class="process-title"><span>{{ process.sequence }}. {{ process.process_name }}</span><StatusTag :status="process.status" category="process" :label="process.status_display" size="small" /></div><span>进度: {{ calculateProcessProgress(process) }}%</span></div></template>
        <el-row :gutter="20" class="process-info-row">
          <el-col :xs="24" :sm="12" :md="6"><div class="process-info-item"><label>负责部门:</label><span>{{ getProcessDepartment(process) }}</span></div></el-col>
          <el-col :xs="24" :sm="12" :md="6"><div class="process-info-item"><label>负责人:</label><span>{{ process.assigned_operator_name || '-' }}</span></div></el-col>
          <el-col :xs="24" :sm="12" :md="6"><div class="process-info-item"><label>开始时间:</label><span>{{ formatDate(process.started_at) }}</span></div></el-col>
          <el-col :xs="24" :sm="12" :md="6"><div class="process-info-item"><label>完成时间:</label><span>{{ formatDate(process.completed_at) }}</span></div></el-col>
        </el-row>
        <div v-if="process.tasks?.length" class="process-tasks">
          <div style="font-size: 12px; color: #909399; margin-bottom: 5px;">任务 ({{ process.tasks.length }}):</div>
          <div class="task-tags"><StatusTag v-for="task in process.tasks" :key="task.id" :status="task.status" category="task" :label="task.work_content" size="small" /></div>
        </div>
      </el-card>
    </div>
  </el-card>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'

const props = defineProps({ processes: { type: Array, default: () => [] }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['add-process', 'start-process', 'complete-process', 'click-process'])

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-'
const getProcessColor = (s) => ({ pending: '#909399', in_progress: '#409EFF', completed: '#67C23A', draft: '#E6A23C' }[s] || '#909399')
const getProcessDepartment = (p) => p.department_name || '-'
const calculateProcessProgress = (p) => p.tasks?.length ? Math.round((p.tasks.filter(t => t.status === 'completed').length / p.tasks.length) * 100) : 0
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.process-item { margin-bottom: 10px; border-left: 4px solid; padding-left: 10px; }
.process-header { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.process-title { display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.process-info-row { row-gap: var(--ui-control-gap); }
.process-info-item { font-size: 14px; }
.process-info-item label { color: #909399; margin-right: 5px; }
.process-tasks { margin-top: var(--ui-control-gap); }
.task-tags { display: flex; flex-wrap: wrap; gap: 5px; }
</style>
