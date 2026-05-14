<template>
  <div class="task-list-view">
    <div class="table-scroll">
    <el-table v-loading="loading" :data="tasks" border class="task-table" @row-click="handleRowClick">
      <el-table-column prop="id" label="任务ID" width="80" align="center" />
      <el-table-column label="施工单号" width="150"><template #default="scope">{{ scope.row.work_order_process_info?.work_order?.order_number || '-' }}</template></el-table-column>
      <el-table-column prop="work_content" label="任务内容" min-width="200" show-overflow-tooltip />
      <el-table-column label="任务类型" width="120"><template #default="scope"><el-tag :type="getTaskTypeTagType(scope.row.task_type)" size="small">{{ scope.row.task_type_display }}</el-tag></template></el-table-column>
      <el-table-column label="状态" width="100" align="center"><template #default="scope"><el-tag :type="getStatusTagType(scope.row.status)" size="small">{{ scope.row.status_display }}</el-tag></template></el-table-column>
      <el-table-column label="操作员" width="120"><template #default="scope">{{ scope.row.assigned_operator_name || '未分配' }}</template></el-table-column>
      <el-table-column label="进度" width="150"><template #default="scope"><el-progress :percentage="calculateProgress(scope.row)" :color="getProgressColor(scope.row)" /></template></el-table-column>
      <el-table-column label="截止日期" width="120"><template #default="scope"><span :class="{ 'text-overdue': isOverdue(scope.row) }">{{ formatDate(getTaskDeadline(scope.row)) }}</span></template></el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button v-if="canUpdate(scope.row)" type="primary" size="small" :icon="Edit" @click.stop="handleUpdate(scope.row)">更新</el-button>
          <el-button v-if="canAssign(scope.row)" type="warning" size="small" :icon="User" @click.stop="handleAssign(scope.row)">分派</el-button>
          <el-button v-if="canComplete(scope.row)" type="success" size="small" :icon="Check" @click.stop="handleComplete(scope.row)">完成</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
    <div class="pagination-row"><el-pagination :current-page="currentPage" :page-size="pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="v => emit('page-size-change', v)" @current-change="v => emit('page-change', v)" /></div>
  </div>
</template>

<script setup>
import { Edit, User, Check } from '@element-plus/icons-vue'

const props = defineProps({ tasks: { type: Array, default: () => [] }, editable: { type: Boolean, default: false }, loading: { type: Boolean, default: false }, total: { type: Number, default: 0 }, currentPage: { type: Number, default: 1 }, pageSize: { type: Number, default: 20 } })
const emit = defineEmits(['row-click', 'task-update', 'task-assign', 'task-complete', 'page-size-change', 'page-change'])

const getTaskTypeTagType = (type) => ({ plate_making: 'success', cutting: 'info', printing: 'primary', foiling: 'warning', embossing: 'warning', die_cutting: 'warning', packaging: 'info', general: 'info' })[type] || '';
const getStatusTagType = (status) => ({ pending: 'info', in_progress: 'primary', completed: 'success', cancelled: 'danger' })[status] || 'info';
const getTaskDeadline = (task) => task.deadline || task.due_date || null;
const calculateProgress = (task) => task.production_quantity ? Math.round(((task.quantity_completed || 0) / task.production_quantity) * 100) : 0;
const getProgressColor = (task) => calculateProgress(task) === 100 ? '#67C23A' : '#409EFF';
const isOverdue = (task) => { const dl = getTaskDeadline(task); return dl && new Date(dl) < new Date() };
const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('zh-CN') : '-';

const canUpdate = (task) => props.editable && task.status !== 'completed' && task.status !== 'cancelled';
const canAssign = (task) => props.editable && task.status !== 'completed';
const canComplete = (task) => props.editable && task.status !== 'completed';

const handleRowClick = (row) => emit('row-click', row);
const handleUpdate = (task) => emit('task-update', task);
const handleAssign = (task) => emit('task-assign', task);
const handleComplete = (task) => emit('task-complete', task);
const handleSizeChange = (size) => emit('page-size-change', size)
const handleCurrentChange = (page) => emit('page-change', page)
</script>

<style scoped>
.task-list-view { margin-top: var(--ui-section-gap); }
.table-scroll { overflow-x: auto; }
.task-table { width: 100%; }
.pagination-row { margin-top: var(--ui-section-gap); text-align: right; }
.text-overdue { color: #F56C6C; font-weight: bold; }
.el-table { cursor: pointer; }
.el-table :deep(.el-table__row:hover) { background-color: #F5F7FA; }
</style>
