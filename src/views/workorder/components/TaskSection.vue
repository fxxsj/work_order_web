<template>
  <div v-loading="loading" class="task-section">
    <div class="task-stats">
      <el-row :gutter="20" align="middle">
        <el-col :xs="12" :sm="8" :md="5"><div class="stat-item"><div class="stat-value">{{ taskStats.total }}</div><div class="stat-label">全部任务</div></div></el-col>
        <el-col :xs="12" :sm="8" :md="5"><div class="stat-item draft"><div class="stat-value">{{ taskStats.draft }}</div><div class="stat-label">草稿</div></div></el-col>
        <el-col :xs="12" :sm="8" :md="5"><div class="stat-item pending"><div class="stat-value">{{ taskStats.pending }}</div><div class="stat-label">待处理</div></div></el-col>
        <el-col :xs="12" :sm="8" :md="5"><div class="stat-item completed"><div class="stat-value">{{ taskStats.completed }}</div><div class="stat-label">已完成</div></div></el-col>
        <el-col :xs="24" :sm="8" :md="4"><div class="progress-display"><div class="progress-label">完成进度</div><el-progress type="circle" :percentage="taskStats.progress || 0" :width="60" /></div></el-col>
      </el-row>
    </div>
    <div class="table-scroll">
    <el-table :data="tasks" border size="small" style="margin-top: 10px;">
      <el-table-column prop="id" label="ID" width="60" align="center" />
      <el-table-column prop="work_content" label="任务内容" min-width="150" />
      <el-table-column prop="task_type_display" label="类型" width="100" />
      <el-table-column prop="status_display" label="状态" width="100"><template #default="scope"><el-tag :type="getStatusType(scope.row.status)" size="small">{{ scope.row.status_display }}</el-tag></template></el-table-column>
      <el-table-column prop="production_quantity" label="数量" width="100" align="center" />
    </el-table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ tasks: { type: Array, default: () => [] }, taskStats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
const getStatusType = (s) => ({ pending: 'info', in_progress: 'primary', completed: 'success', draft: 'warning' })[s] || 'info';
</script>

<style scoped>
.task-section { padding: 10px; }
.task-stats :deep(.el-row) { row-gap: var(--ui-control-gap); }
.table-scroll { overflow-x: auto; }
.stat-item { text-align: center; padding: 10px; }
.stat-value { font-size: 24px; font-weight: bold; color: #409EFF; }
.stat-item.draft .stat-value { color: #909399; }
.stat-item.pending .stat-value { color: #E6A23C; }
.stat-item.completed .stat-value { color: #67C23A; }
.stat-label { font-size: 12px; color: #909399; }
.progress-display { text-align: center; }
.progress-label { font-size: 12px; color: #909399; margin-bottom: 5px; }
</style>
