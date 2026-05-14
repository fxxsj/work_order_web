<template>
  <div class="task-management">
    <div class="table-scroll">
    <el-table :data="tasks" border class="task-table" size="small">
      <el-table-column prop="id" label="任务ID" width="80" align="center" />
      <el-table-column label="任务名称" min-width="150"><template #default="scope">{{ scope.row.work_content || scope.row.task_name || '-' }}</template></el-table-column>
      <el-table-column label="操作员" width="100"><template #default="scope">{{ scope.row.assigned_operator_name || scope.row.operator_name || '-' }}</template></el-table-column>
      <el-table-column label="状态" width="100" align="center"><template #default="scope"><el-tag :type="getTaskStatusType(scope.row.status)" size="small">{{ scope.row.status_display }}</el-tag></template></el-table-column>
      <el-table-column label="进度" width="120" align="center"><template #default="scope"><el-progress :percentage="calculateTaskProgress(scope.row)" :color="getProgressColor(scope.row)" /></template></el-table-column>
      <el-table-column label="完成数量" width="100" align="right"><template #default="scope">{{ scope.row.quantity_completed || 0 }} / {{ scope.row.production_quantity || 0 }}</template></el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ tasks: { type: Array, default: () => [] } })

const getTaskStatusType = (s) => ({ pending: 'info', in_progress: 'primary', completed: 'success', draft: 'warning', cancelled: 'danger' })[s] || 'info';
const calculateTaskProgress = (t) => t.production_quantity ? Math.round(((t.quantity_completed || 0) / t.production_quantity) * 100) : 0
const getProgressColor = (t) => calculateTaskProgress(t) === 100 ? '#67C23A' : '#409EFF'
</script>

<style scoped>
.table-scroll {
  margin-top: var(--ui-control-gap);
  overflow-x: auto;
}

.task-table {
  width: 100%;
}
</style>
