<template>
  <CrudPageLayout
    title="销售订单"
    :loading="loading"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    @size-change="handleSizeChange"
    @current-change="handlePageChange"
  >
    <template #search>
      <SearchInput v-model="filters.search" placeholder="搜索订单号/客户名称" @search="handleSearch" @clear="handleSearch" />
      <Select v-model="filters.status" :options="statusOptions" class="w-full sm:w-36" placeholder="订单状态" clearable @change="handleSearch" />
      <Select v-model="filters.payment_status" :options="paymentStatusOptions" class="w-full sm:w-36" placeholder="付款状态" clearable @change="handleSearch" />
    </template>
    <template #actions>
      <button class="btn btn-secondary btn-sm" @click="loadData">
        <Icon name="refresh" class="h-4 w-4" />
        刷新
      </button>
      <button class="btn btn-success btn-sm" :disabled="!canBatchConvert" @click="handleBatchConvert">
        <Icon name="list" class="h-4 w-4" />
        批量转换
      </button>
      <button v-if="canCreate" class="btn btn-primary btn-sm" @click="handleAdd">
        <Icon name="plus" class="h-4 w-4" />
        新建销售订单
      </button>
    </template>

    <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
      <template #cell-selection="{ row }">
        <input type="checkbox" :checked="isSelected(row)" @change="toggleSelect(row)" />
      </template>
      <template #cell-order_number="{ row }">
        <button class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400 p-0" @click="handleView(row)">{{ row.order_number }}</button>
      </template>
      <template #cell-customer_name="{ row }">
        <span class="truncate max-w-xs">{{ row.customer_name }}</span>
      </template>
      <template #cell-delivery_date="{ row }">
        <span :class="{ 'font-bold text-danger-600 dark:text-danger-400': isOverdue(row) }">
          {{ row.delivery_date }}
        </span>
        <Icon v-if="isOverdue(row)" name="warning" class="ml-1 inline h-4 w-4 text-danger-600" />
      </template>
      <template #cell-total_amount="{ row }">
        <span class="font-medium">¥{{ formatAmount(row.total_amount) }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" category="salesOrder" effect="plain" />
      </template>
      <template #cell-payment_status="{ row }">
        <StatusTag :status="row.payment_status" category="payment" effect="plain" />
      </template>
      <template #cell-items_count="{ row }">
        <Tag size="small" type="info">{{ row.items_count || 0 }}</Tag>
      </template>
      <template #cell-actions="{ row }">
        <div class="flex justify-center gap-1">
          <button v-if="canEdit(row)" class="btn btn-icon btn-xs btn-primary" @click="handleEdit(row)"><Icon name="edit" class="h-3 w-3" /></button>
          <button v-if="canConvert(row)" class="btn btn-icon btn-xs btn-success" @click="handleConvert(row)"><Icon name="list" class="h-3 w-3" /></button>
          <button v-if="row.status === 'draft'" class="btn btn-icon btn-xs btn-success" @click="handleSubmit(row)"><Icon name="upload" class="h-3 w-3" /></button>
          <template v-if="row.status === 'submitted'">
            <button class="btn btn-icon btn-xs btn-success" @click="handleApprove(row)"><Icon name="check" class="h-3 w-3" /></button>
            <button class="btn btn-icon btn-xs btn-warning" @click="handleReject(row)"><Icon name="x" class="h-3 w-3" /></button>
          </template>
          <button class="btn btn-icon btn-xs btn-secondary" @click="handleView(row)"><Icon name="eye" class="h-3 w-3" /></button>
        </div>
      </template>
      <template #empty>
        <EmptyState
          :description="hasFilters ? '未找到匹配的订单' : '暂无销售订单数据'"
          :action-text="hasFilters ? '重置筛选' : undefined"
          @action="handleReset"
        />
      </template>
    </DataTable>

    <template #footer>
      <div v-if="selectedRows.length > 0" class="flex items-center gap-2 text-sm text-gray-500">
        <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
        <span>已选择 {{ selectedRows.length }} 项</span>
      </div>
    </template>
  </CrudPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import { StatusTag, EmptyState, Pagination, Icon, SearchInput, Select, Tag, CrudPageLayout, DataTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const selectedRows = ref<any[]>([])

const columns: Column[] = [
  { key: 'selection', label: '', width: 48, align: 'center' },
  { key: 'order_number', label: '订单号', width: 144 },
  { key: 'customer_name', label: '客户名称', width: 144 },
  { key: 'order_date', label: '订单日期', width: 112 },
  { key: 'delivery_date', label: '交货日期', width: 112 },
  { key: 'total_amount', label: '订单金额', width: 112, align: 'right' },
  { key: 'status', label: '订单状态', width: 96, align: 'center' },
  { key: 'payment_status', label: '付款状态', width: 96, align: 'center' },
  { key: 'items_count', label: '明细数', width: 80, align: 'center' },
  { key: 'actions', label: '操作', width: 192, align: 'center', fixed: 'right' }
]

const statusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'submitted', label: '已提交' },
  { value: 'approved', label: '已审核' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'in_production', label: '生产中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]
const paymentStatusOptions = [
  { value: 'unpaid', label: '未付款' },
  { value: 'partial', label: '部分付款' },
  { value: 'paid', label: '已付款' }
]

const {
  filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters, resetFilters
} = useCrudList(salesOrderAPI, 'getList', { initialFilters: { search: '', status: '', payment_status: '' } })

const canCreate = computed(() => userStore.hasPermission('workorder.add_salesorder'))
const canBatchConvert = computed(() => selectedRows.value.length > 0)

const allSelected = computed(() => tableData.value.length > 0 && tableData.value.every((row: any) => selectedRows.value.some((r: any) => r.id === row.id)))
const isSelected = (row: any) => selectedRows.value.some((r: any) => r.id === row.id)
const toggleSelect = (row: any) => {
  const idx = selectedRows.value.findIndex(r => r.id === row.id)
  if (idx >= 0) selectedRows.value.splice(idx, 1)
  else selectedRows.value.push(row)
}
const toggleSelectAll = () => {
  if (allSelected.value) selectedRows.value = []
  else selectedRows.value = [...tableData.value]
}

const handleSortChange = (payload: any) => { const { prop, order } = payload; /* TODO */ }
const handleReset = () => { resetFilters() }

const handleAdd = () => { router.push('/sales/create') }
const handleView = (row: any) => { router.push(`/sales/${row.id}`) }
const handleEdit = (row: any) => { router.push(`/sales/${row.id}/edit`) }

const canEdit = (row: any) => row.status === 'draft' && userStore.hasPermission('workorder.change_salesorder')
const canConvert = (row: any) => ['approved', 'in_production'].includes(row.status) && userStore.hasPermission('workorder.add_workorder')

const handleConvert = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要将订单"${row.order_number}"转换为施工单？`)
    if (!confirmed) return
    const response: any = await salesOrderAPI.convertToWorkOrder(row.id)
    ElMessage.success('转换成功')
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '转换失败') }
}

const handleBatchConvert = async () => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要将 ${selectedRows.value.length} 个订单转换为施工单？`)
    if (!confirmed) return
    const orderIds = selectedRows.value.map((r: any) => r.id)
    const response: any = await salesOrderAPI.batchConvertToWorkOrder(orderIds)
    ElMessage.success(`成功转换 ${response.success_count} 个订单`)
    selectedRows.value = []
    loadData()
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '批量转换失败') }
}

const handleSubmit = async (row: any) => {
  try { await salesOrderAPI.submit(row.id); ElMessage.success('提交成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '提交失败') }
}

const handleApprove = async (row: any) => {
  try { await salesOrderAPI.approve(row.id); ElMessage.success('审核通过'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '审核失败') }
}

const handleReject = async (row: any) => {
  try { await salesOrderAPI.reject(row.id); ElMessage.success('已拒绝'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '操作失败') }
}

const isOverdue = (row: any) => row.delivery_date && new Date(row.delivery_date) < new Date() && !['completed', 'cancelled'].includes(row.status)
const formatAmount = (amount: any) => amount ? amount.toLocaleString() : '0.00'

onMounted(() => { loadData() })
</script>
