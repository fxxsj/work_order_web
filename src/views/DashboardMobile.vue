<template>
  <div v-loading="loading" class="dashboard-mobile">
    <div class="mobile-header"><div class="header-title"><el-icon><HomeFilled /></el-icon><span>工作台</span></div><div class="header-actions"><el-button type="primary" size="small" :icon="Plus" @click="createWorkOrder">新建</el-button></div></div>
    <div class="quick-stats">
      <div class="stat-card pending" @click="goToOrders('pending')"><div class="stat-icon"><el-icon><Clock /></el-icon></div><div class="stat-content"><div class="stat-number">{{ statistics.pending_orders || 0 }}</div><div class="stat-label">待开始</div></div></div>
      <div class="stat-card progress" @click="goToOrders('in_progress')"><div class="stat-icon"><el-icon><Loading /></el-icon></div><div class="stat-content"><div class="stat-number">{{ statistics.in_progress_orders || 0 }}</div><div class="stat-label">进行中</div></div></div>
      <div class="stat-card urgent" @click="goToUrgentPriority"><div class="stat-icon"><el-icon><Warning /></el-icon></div><div class="stat-content"><div class="stat-number">{{ statistics.urgent_orders || 0 }}</div><div class="stat-label">紧急</div></div></div>
      <div class="stat-card approval" @click="goToApprovals"><div class="stat-icon"><el-icon><Checked /></el-icon></div><div class="stat-content"><div class="stat-number">{{ statistics.pending_approval || 0 }}</div><div class="stat-label">待审核</div></div></div>
    </div>
    <el-card style="margin-top: 15px;"><template #header><span>最近的施工单</span></template><el-table :data="recentOrders" style="width: 100%"><el-table-column prop="order_number" label="施工单号" width="120" /><el-table-column prop="customer_name" label="客户" /><el-table-column label="状态" width="80"><template #default="scope"><el-tag :type="getStatusType(scope.row.status)" size="small">{{ scope.row.status_display }}</el-tag></template></el-table-column></el-table></el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Clock, Loading, Warning, Checked, Plus } from '@element-plus/icons-vue'
import { workOrderAPI } from '@/api/modules'

const router = useRouter()
const loading = ref(false)
const statistics = reactive({ pending_orders: 0, in_progress_orders: 0, urgent_orders: 0, pending_approval: 0 })
const recentOrders = ref([])

onMounted(async () => {
  loading.value = true
  try { const res = await workOrderAPI.getStatistics(); Object.assign(statistics, res || {}) } catch (e) {}
  try { const res = await workOrderAPI.getList({ page_size: 5 }); recentOrders.value = res?.results || [] } catch (e) {}
  loading.value = false
})

const createWorkOrder = () => router.push('/workorders/create')
const goToOrders = (status) => router.push({ path: '/workorders', query: status ? { status } : {} })
const goToUrgentPriority = () => router.push({ path: '/workorders', query: { priority: 'urgent' } })
const goToApprovals = () => router.push('/workorders?approval_status=pending')
const getStatusType = (s) => ({ pending: 'info', in_progress: 'primary', completed: 'success' })[s] || 'info')
</script>

<style scoped>
.dashboard-mobile { padding: 15px; }
.mobile-header { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #409EFF; color: #fff; border-radius: 8px; margin-bottom: 15px; }
.header-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; }
.quick-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.stat-card { border-radius: 8px; padding: 15px; cursor: pointer; color: #fff; }
.stat-card.pending { background: linear-gradient(135deg, #909399, #C0C4CC); }
.stat-card.progress { background: linear-gradient(135deg, #E6A23C, #F5C76C); }
.stat-card.urgent { background: linear-gradient(135deg, #F56C6C, #F89898); }
.stat-card.approval { background: linear-gradient(135deg, #409EFF, #66B1FF); }
.stat-icon { font-size: 24px; margin-bottom: 8px; }
.stat-number { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; opacity: 0.9; }
</style>
