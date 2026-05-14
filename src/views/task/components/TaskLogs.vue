<template>
  <div v-if="task.logs?.length" class="task-logs">
    <div class="task-logs-title">{{ task.work_content }} - 操作记录（{{ task.logs.length }}条）</div>
    <div class="table-scroll">
    <el-table :data="task.logs" border size="small" class="logs-table">
      <el-table-column prop="created_at" label="操作时间" width="160"><template #default="scope">{{ formatDateTime(scope.row.created_at) }}</template></el-table-column>
      <el-table-column prop="operator_name" label="操作人" width="120" />
      <el-table-column prop="log_type_display" label="操作类型" width="100" />
      <el-table-column label="数量变化" width="180">
        <template #default="scope">
          <span v-if="scope.row.quantity_before !== null && scope.row.quantity_after !== null">{{ scope.row.quantity_before }} → {{ scope.row.quantity_after }}
            <span v-if="scope.row.quantity_increment > 0" class="quantity-increment positive">(+{{ scope.row.quantity_increment }})</span>
            <span v-else-if="scope.row.quantity_increment < 0" class="quantity-increment negative">({{ scope.row.quantity_increment }})</span>
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态变化" width="150"><template #default="scope"><span v-if="scope.row.status_before && scope.row.status_after">{{ getStatusText(scope.row.status_before) }} → {{ getStatusText(scope.row.status_after) }}</span><span v-else>-</span></template></el-table-column>
      <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
    </el-table>
    </div>
  </div>
  <div v-else class="empty-logs">暂无操作记录</div>
</template>

<script setup>
const props = defineProps({ task: { type: Object, required: true } })
const formatDateTime = (v) => v ? new Date(v).toLocaleString('zh-CN') : '-'
const getStatusText = (s) => ({ pending: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消' })[s] || s
</script>

<style scoped>
.task-logs {
  padding: var(--ui-section-gap);
  background-color: #f5f7fa;
}

.task-logs-title {
  color: #409EFF;
  font-weight: bold;
  margin-bottom: var(--ui-control-gap);
}

.table-scroll {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
}

.quantity-increment {
  display: inline-block;
  margin-left: 5px;
  font-weight: bold;
}

.quantity-increment.positive {
  color: #67C23A;
}

.quantity-increment.negative {
  color: #F56C6C;
}

.empty-logs {
  color: #909399;
  padding: var(--ui-section-gap);
  text-align: center;
}
</style>
