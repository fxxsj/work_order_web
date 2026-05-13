<template>
  <el-card>
    <template #header><div class="card-header"><span>我的待处理任务</span><el-button type="primary" size="small" @click="emit('view-all')">查看全部</el-button></div></template>
    <el-table :data="tasks" style="width: 100%">
      <el-table-column label="施工单号" width="150"><template #default="scope"><el-link v-if="scope.row.work_order_process_info?.work_order?.id" type="primary" @click="goTo(`/workorders/${scope.row.work_order_process_info.work_order.id}`)">{{ scope.row.work_order_process_info.work_order.order_number || '-' }}</el-link><span v-else>-</span></template></el-table-column>
      <el-table-column prop="work_content" label="任务内容" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="100"><template #default="scope"><el-tag :type="getStatusType(scope.row.status)" size="small">{{ getStatusDisplay(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column label="进度" width="150"><template #default="scope"><el-progress :percentage="getProgress(scope.row)" :color="getProgress(scope.row) === 100 ? '#67C23A' : '#409EFF'" /></template></el-table-column>
      <el-table-column label="操作" width="100" fixed="right"><template #default=""><el-button type="text" size="small" @click="goTo('/tasks')">详情</el-button></template></el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({ tasks: { type: Array, default: () => [] } })
const emit = defineEmits(['view-all'])
const router = useRouter()
const goTo = (path) => router.push(path)

const getStatusType = (s) => ({ pending: 'info', in_progress: 'primary', completed: 'success' })[s] || 'info';
const getStatusDisplay = (s) => ({ pending: '待开始', in_progress: '进行中', completed: '已完成' })[s] || s;
const getProgress = (t) => t.production_quantity ? Math.round(((t.quantity_completed || 0) / t.production_quantity) * 100) : 0;
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
