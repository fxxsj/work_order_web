<template>
  <div class="space-y-6">
    <StatsCards
      title="收款计划统计"
      :items="statItems"
      :loading="statsLoading"
      layout="media"
    />

    <TablePageLayout>
      <template #filters>
        <FilterRow>
          <SearchInput
            v-model="searchText"
            class="w-full sm:w-72"
            placeholder="搜索客户订单/客户/计划日期"
            @search="searchAndRefreshStats"
            @clear="searchAndRefreshStats"
          />
          <Select
            v-model="filters.status"
            :options="statusOptions"
            class="w-full sm:w-36"
            placeholder="状态"
            clearable
            @change="searchAndRefreshStats"
          />
          <Select
            v-model="filters.todo"
            :options="todoOptions"
            class="w-full sm:w-36"
            placeholder="待办事项"
            clearable
            @change="searchAndRefreshStats"
          />
          <input
            v-model="filters.start_date"
            type="date"
            class="input w-36"
            @change="searchAndRefreshStats"
          >
          <input
            v-model="filters.end_date"
            type="date"
            class="input w-36"
            @change="searchAndRefreshStats"
          >
        </FilterRow>
      </template>

      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            :disabled="loading"
            class="btn btn-secondary"
            title="刷新"
            @click="reloadData"
          >
            <Icon
              name="refresh"
              size="md"
              :class="loading ? 'animate-spin' : ''"
            />
          </button>
        </div>
      </template>

      <template #table>
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :row-key="(row: any) => row.id"
          :server-side-sort="true"
          default-sort-key="plan_date"
          default-sort-order="asc"
          @sort="handleSort"
        >
          <template #cell-plan_amount="{ row }">
            <span>¥{{ formatAmount(row.plan_amount) }}</span>
          </template>
          <template #cell-paid_amount="{ row }">
            <span>¥{{ formatAmount(row.paid_amount) }}</span>
          </template>
          <template #cell-remaining_amount="{ row }">
            <span :class="row.remaining_amount > 0 ? 'text-warning-600 dark:text-warning-400' : 'text-success-600 dark:text-success-400'">
              ¥{{ formatAmount(row.remaining_amount) }}
            </span>
          </template>
          <template #cell-progress_percentage="{ row }">
            <span>{{ row.progress_percentage ?? 0 }}%</span>
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="payment"
              :label="row.status_display"
            />
          </template>
          <template #cell-follow_up_text="{ row }">
            <span>{{ row.follow_up_text || '-' }}</span>
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="action => handleRowAction(action.key, row)"
            />
          </template>
          <template #empty>
            <EmptyState
              :description="hasFilters ? '未找到匹配的收款计划' : '暂无收款计划数据'"
              :action-text="hasFilters ? '重置筛选' : undefined"
              @action="handleReset"
            />
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          :total="total"
          :page="currentPage"
          :page-size="pageSize"
          @update:page="handlePageChange"
          @update:page-size="handleSizeChange"
        />
      </template>
    </TablePageLayout>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { paymentPlanAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, RowActions, FilterRow, Select, StatusTag, StatsCards } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const statsLoading = ref(false)
const stats = ref<any>({})
const sortKey = ref('plan_date')
const sortOrder = ref<'asc' | 'desc'>('asc')

const sortFieldMap: Record<string, string> = {
  sales_order_number: 'sales_order__order_number',
  customer_name: 'sales_order__customer__name',
  remaining_amount: 'plan_amount',
  progress_percentage: 'paid_amount'
}

const columns: Column[] = [
  { key: 'sales_order_number', label: '客户订单号', width: 144, sortable: true },
  { key: 'customer_name', label: '客户', width: 160, sortable: true },
  { key: 'plan_amount', label: '计划金额', width: 112, align: 'right', sortable: true },
  { key: 'paid_amount', label: '已收金额', width: 112, align: 'right', sortable: true },
  { key: 'remaining_amount', label: '待收金额', width: 112, align: 'right' },
  { key: 'progress_percentage', label: '进度', width: 88, align: 'right' },
  { key: 'plan_date', label: '计划日期', width: 112, sortable: true },
  { key: 'status', label: '状态', width: 96, sortable: true },
  { key: 'follow_up_text', label: '下一步', width: 180 },
  { key: 'actions', label: '操作', width: 120, fixed: 'right' }
]

const statusOptions = [
  { label: '待收款', value: 'pending' },
  { label: '部分收款', value: 'partial' },
  { label: '已完成', value: 'completed' }
]

const todoOptions = [
  { label: '已逾期', value: 'overdue' },
  { label: '今日到期', value: 'due_today' }
]

const buildPaymentPlanParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  return {
    ...params,
    ordering: sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  }
}

const {
  searchText,
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetFilters,
  hasFilters
} = useCrudList(paymentPlanAPI, 'getList', {
  initialFilters: { status: '', todo: '', start_date: '', end_date: '' },
  buildParams: buildPaymentPlanParams,
  errorContext: '加载收款计划数据失败'
})

const { canEdit } = useCrudPermission('paymentplan')

const statItems = computed(() => [
  { key: 'planned', label: '计划金额', value: stats.value.planned_amount, format: 'currency', iconName: 'document', tone: 'primary' },
  { key: 'paid', label: '已收金额', value: stats.value.paid_amount, format: 'currency', iconName: 'checkCircle', tone: 'success' },
  { key: 'remaining', label: '待收金额', value: stats.value.remaining_amount, format: 'currency', iconName: 'clock', tone: 'warning' },
  { key: 'overdue', label: '逾期金额', value: stats.value.overdue_amount, format: 'currency', iconName: 'exclamationTriangle', tone: 'danger' }
])

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await paymentPlanAPI.getSummary(buildPaymentPlanParams({
      search: searchText.value,
      status: filters.value.status,
      todo: filters.value.todo,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    }))
    const payload = response?.data || response
    stats.value = payload?.summary || {}
  } catch (error: any) {
    stats.value = {}
  } finally {
    statsLoading.value = false
  }
}

const reloadData = async () => {
  await loadData()
  fetchStats()
}

const searchAndRefreshStats = async () => {
  await handleSearch()
  fetchStats()
}

const handleReset = async () => {
  await resetFilters()
  fetchStats()
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  reloadData()
}

const getRowActions = (row: any): RowAction[] => {
  if (!canEdit.value || row.status === 'completed') return []
  return [{ key: 'update_status', label: '更新状态', icon: 'refresh', tone: 'primary' }]
}

const handleRowAction = async (action: string, row: any) => {
  if (action !== 'update_status') return
  try {
    await paymentPlanAPI.updateStatus(row.id)
    useUIStore().showSuccess('状态已更新')
    reloadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '更新状态失败')
  }
}

const formatAmount = (value: unknown) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

onMounted(() => { reloadData() })
</script>
