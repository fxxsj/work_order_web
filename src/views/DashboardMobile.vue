<template>
  <div class="page-container space-y-[var(--ui-section-gap)]">
    <div class="flex flex-col items-stretch gap-[var(--ui-control-gap)] rounded-xl bg-info-500 p-[var(--ui-control-gap)] text-white md:flex-row md:items-center md:justify-between">
      <div class="flex items-center gap-2 text-lg font-bold">
        <Icon name="home" /><span>工作台</span>
      </div>
      <div class="header-actions">
        <button
          class="btn btn-primary btn-sm w-full md:w-auto"
          @click="createWorkOrder"
        >
          <Icon
            name="plus"
            class="h-3 w-3"
          /> 新建
        </button>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-[var(--ui-control-gap)] md:grid-cols-4">
      <div
        class="flex cursor-pointer flex-col rounded-xl bg-gradient-to-br from-gray-500 to-gray-400 p-[var(--ui-control-gap)] text-white min-h-[var(--ui-touch-target-min)]"
        @click="goToOrders('pending')"
      >
        <div class="text-2xl mb-2">
          <Icon name="clock" />
        </div>
        <div class="text-2xl font-bold">
          {{ statistics.pending_orders || 0 }}
        </div>
        <div class="text-xs opacity-90">
          待开始
        </div>
      </div>
      <div
        class="flex cursor-pointer flex-col rounded-xl bg-gradient-to-br from-warning-500 to-warning-300 p-[var(--ui-control-gap)] text-white min-h-[var(--ui-touch-target-min)]"
        @click="goToOrders('in_progress')"
      >
        <div class="text-2xl mb-2">
          <Icon name="loading" />
        </div>
        <div class="text-2xl font-bold">
          {{ statistics.in_progress_orders || 0 }}
        </div>
        <div class="text-xs opacity-90">
          进行中
        </div>
      </div>
      <div
        class="flex cursor-pointer flex-col rounded-xl bg-gradient-to-br from-danger-500 to-danger-300 p-[var(--ui-control-gap)] text-white min-h-[var(--ui-touch-target-min)]"
        @click="goToUrgentPriority"
      >
        <div class="text-2xl mb-2">
          <Icon name="exclamationTriangle" />
        </div>
        <div class="text-2xl font-bold">
          {{ statistics.urgent_orders || 0 }}
        </div>
        <div class="text-xs opacity-90">
          紧急
        </div>
      </div>
      <div
        class="flex cursor-pointer flex-col rounded-xl bg-gradient-to-br from-info-500 to-info-300 p-[var(--ui-control-gap)] text-white min-h-[var(--ui-touch-target-min)]"
        @click="goToApprovals"
      >
        <div class="text-2xl mb-2">
          <Icon name="checkCircle" />
        </div>
        <div class="text-2xl font-bold">
          {{ statistics.pending_approval || 0 }}
        </div>
        <div class="text-xs opacity-90">
          待审核
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <span>最近的施工单</span>
      </div>
      <div class="card-body">
        <SummaryTable
          :columns="columns"
          :data="recentOrders"
        >
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              :label="row.status_display"
              category="workOrder"
              size="small"
            />
          </template>
        </SummaryTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { workOrderAPI } from '@/api/modules'
import { Icon, StatusTag, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const router = useRouter()
const loading = ref(false)
const statistics = reactive({ pending_orders: 0, in_progress_orders: 0, urgent_orders: 0, pending_approval: 0 })
const recentOrders = ref<any[]>([])

const columns: Column[] = [
  { key: 'order_number', label: '施工单号', width: 128 },
  { key: 'customer_name', label: '客户' },
  { key: 'status', label: '状态', width: 96 },
]

onMounted(async () => {
  loading.value = true
  try { const res: any = await workOrderAPI.getStatistics(); Object.assign(statistics, res || {}) } catch (_error: any) { /* no-op */ }
  try { const res: any = await workOrderAPI.getList({ page_size: 5 }); recentOrders.value = res?.results || [] } catch (_error: any) { /* no-op */ }
  loading.value = false
})

const createWorkOrder = () => router.push('/workorders/create')
const goToOrders = (status: any) => router.push({ path: '/workorders', query: status ? { status } : {} })
const goToUrgentPriority = () => router.push({ path: '/workorders', query: { priority: 'urgent' } })
const goToApprovals = () => router.push('/workorders?approval_status=submitted')
</script>
