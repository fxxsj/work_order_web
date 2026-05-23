<template>
  <div class="dashboard-mobile">
    <div class="mobile-header"><div class="header-title"><Icon name="home" /><span>工作台</span></div><div class="header-actions"><button class="btn btn-primary btn-sm" @click="createWorkOrder"><Icon name="plus" class="h-3 w-3" /> 新建</button></div></div>
    <div class="quick-stats">
      <div class="stat-card pending" @click="goToOrders('pending')"><div class="stat-icon"><Icon name="clock" /></div><div class="stat-content"><div class="stat-number">{{ statistics.pending_orders || 0 }}</div><div class="stat-label">待开始</div></div></div>
      <div class="stat-card progress" @click="goToOrders('in_progress')"><div class="stat-icon"><Icon name="loading" /></div><div class="stat-content"><div class="stat-number">{{ statistics.in_progress_orders || 0 }}</div><div class="stat-label">进行中</div></div></div>
      <div class="stat-card urgent" @click="goToUrgentPriority"><div class="stat-icon"><Icon name="exclamationTriangle" /></div><div class="stat-content"><div class="stat-number">{{ statistics.urgent_orders || 0 }}</div><div class="stat-label">紧急</div></div></div>
      <div class="stat-card approval" @click="goToApprovals"><div class="stat-icon"><Icon name="checkCircle" /></div><div class="stat-content"><div class="stat-number">{{ statistics.pending_approval || 0 }}</div><div class="stat-label">待审核</div></div></div>
    </div>
    <div class="card">
  <div class="card-header flex items-center justify-between">
    <span>最近的施工单</span>
  </div>
  <div class="card-body">
    <div class="table-scroll">
        <table class="data-table w-full">
          <thead>
            <tr>
              <th class="w-32">施工单号</th>
              <th class="min-w-32">客户</th>
              <th class="w-24">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in recentOrders" :key="row.id">
              <td>{{ row.order_number }}</td>
              <td>{{ row.customer_name }}</td>
              <td><StatusTag :status="row.status" :label="row.status_display" category="workOrder" size="small" /></td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { workOrderAPI } from '@/api/modules'
import { Icon, StatusTag } from '@/components/common'

const router = useRouter()
const loading = ref(false)
const statistics = reactive({ pending_orders: 0, in_progress_orders: 0, urgent_orders: 0, pending_approval: 0 })
const recentOrders = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try { const res: any = await workOrderAPI.getStatistics(); Object.assign(statistics, res || {}) } catch (e: any) {}
  try { const res: any = await workOrderAPI.getList({ page_size: 5 }); recentOrders.value = res?.results || [] } catch (e: any) {}
  loading.value = false
})

const createWorkOrder = () => router.push('/workorders/create')
const goToOrders = (status: any) => router.push({ path: '/workorders', query: status ? { status } : {} })
const goToUrgentPriority = () => router.push({ path: '/workorders', query: { priority: 'urgent' } })
const goToApprovals = () => router.push('/workorders?approval_status=pending')
</script>

<style lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.dashboard-mobile { padding: var(--ui-page-padding); }
.mobile-header { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); padding: var(--ui-control-gap); background: #409EFF; color: #fff; border-radius: var(--ui-radius-card); margin-bottom: var(--ui-section-gap); }
.header-title { display: flex; align-items: center; gap: 8px; font-size: 18px; font-weight: bold; }
.quick-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--ui-control-gap); }
.stat-card { border-radius: var(--ui-radius-card); padding: var(--ui-control-gap); cursor: pointer; color: #fff; min-height: var(--ui-touch-target-min); }
.stat-card.pending { background: linear-gradient(135deg, #909399, #C0C4CC); }
.stat-card.progress { background: linear-gradient(135deg, #E6A23C, #F5C76C); }
.stat-card.urgent { background: linear-gradient(135deg, #F56C6C, #F89898); }
.stat-card.approval { background: linear-gradient(135deg, #409EFF, #66B1FF); }
.stat-icon { font-size: 24px; margin-bottom: 8px; }
.stat-number { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; opacity: 0.9; }
.recent-orders-card { margin-top: var(--ui-section-gap); }
.table-scroll { overflow-x: auto; }
.recent-orders-table { width: 100%; }

@media (max-width: bp.$breakpoint-phone-max) {
  .mobile-header,
  .header-actions button {
    width: 100%;
  }

  .mobile-header {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
