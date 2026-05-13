<template>
  <el-card style="margin-top: 20px;">
    <template #header><div class="card-header"><span>工序和任务管理</span><div><el-radio-group :model-value="viewMode" size="small" style="margin-right: 10px;" @update:model-value="v => emit('view-mode-change', v)"><el-radio-button value="timeline">时间线</el-radio-button><el-radio-button value="flowchart">流程图</el-radio-button><el-radio-button value="list">列表</el-radio-button></el-radio-group><el-button size="small" type="primary" :icon="Plus" @click="emit('add-process')">添加工序</el-button></div></div></template>
    <div v-if="viewMode === 'list'">
      <el-table :data="processes" border size="small">
        <el-table-column prop="sequence" label="序号" width="60" align="center" />
        <el-table-column prop="process_name" label="工序名称" min-width="150" />
        <el-table-column prop="status_display" label="状态" width="100"><template #default="scope"><el-tag :type="getStatusType(scope.row.status)" size="small">{{ scope.row.status_display }}</el-tag></template></el-table-column>
        <el-table-column prop="department_name" label="负责部门" width="120" />
        <el-table-column prop="assigned_operator_name" label="负责人" width="100" />
        <el-table-column label="任务数" width="80" align="center"><template #default="scope">{{ scope.row.tasks?.length || 0 }}</template></el-table-column>
        <el-table-column label="操作" width="180"><template #default="scope"><el-button type="text" size="small" @click="emit('process-click', scope.row)">详情</el-button></template></el-table-column>
      </el-table>
    </div>
    <el-empty v-else description="其他视图暂未实现" />
  </el-card>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  workOrder: { type: Object, default: null },
  processes: { type: Array, default: () => [] },
  allTasks: { type: Array, default: () => [] },
  viewMode: { type: String, default: 'list' }
})

const emit = defineEmits(['add-process', 'process-click', 'view-mode-change'])
const getStatusType = (s) => ({ pending: 'info', in_progress: 'primary', completed: 'success', draft: 'warning' })[s] || 'info')
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
