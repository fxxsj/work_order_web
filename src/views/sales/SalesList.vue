<template>
  <TablePageLayout
    title="销售订单"
    :loading="loading"
  >
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput v-model="filters.search" class="w-full sm:w-64" placeholder="搜索订单号/客户名称" @search="handleSearch" @clear="handleSearch" />
          <Select v-model="filters.status" :options="statusOptions" class="w-full sm:w-36" placeholder="订单状态" clearable @change="handleSearch" />
          <Select v-model="filters.payment_status" :options="paymentStatusOptions" class="w-full sm:w-36" placeholder="付款状态" clearable @change="handleSearch" />
          <button class="btn btn-secondary" @click="handleReset">重置</button>
        </div>
      </div>
    </template>
    
    <template #actions>
      <div class="flex justify-end gap-3">
        <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button class="btn btn-secondary" :disabled="!canBatchConvert" @click="handleBatchConvertRequest">
          <Icon name="list" size="md" class="mr-2" />
          批量转换
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="handleAdd">
          <Icon name="plus" size="md" class="mr-2" />
          新建销售订单
        </button>
      </div>
    </template>

    <template #table>
      <DataTable 
        :columns="columns" 
        :data="tableData" 
        :loading="loading" 
        :row-key="(row: any) => row.id"
      >
        <template #cell-selection="{ row }">
          <input type="checkbox" :checked="isSelected(row)" @change="toggleSelect(row)" class="rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
        </template>
        
        <template #cell-order_number="{ row }">
          <span class="cursor-pointer font-medium text-primary-600 hover:underline dark:text-primary-400" @click="handleView(row)">
            {{ row.order_number }}
          </span>
        </template>
        
        <template #cell-customer_name="{ row }">
          <span class="truncate max-w-xs">{{ row.customer_name }}</span>
        </template>
        
        <template #cell-delivery_date="{ row }">
          <span :class="{ 'font-bold text-red-600 dark:text-red-400': isOverdue(row) }">
            {{ row.delivery_date }}
          </span>
          <Icon v-if="isOverdue(row)" name="warning" class="ml-1 inline h-4 w-4 text-red-600" />
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
          <div class="flex items-center justify-center gap-1">
            <button v-if="canEdit(row)" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400" @click="handleEdit(row)">
              <Icon name="edit" size="sm" />
              <span class="text-[10px]">编辑</span>
            </button>
            <button v-if="canConvert(row)" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-dark-700 dark:hover:text-green-400" @click="handleConvertRequest(row)">
              <Icon name="list" size="sm" />
              <span class="text-[10px]">转换</span>
            </button>
            <button v-if="row.status === 'draft'" class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-dark-700 dark:hover:text-blue-400" @click="handleSubmit(row)">
              <Icon name="upload" size="sm" />
              <span class="text-[10px]">提交</span>
            </button>
            <template v-if="row.status === 'submitted'">
              <button class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-green-600 dark:hover:bg-dark-700 dark:hover:text-green-400" @click="handleApprove(row)">
                <Icon name="check" size="sm" />
                <span class="text-[10px]">审核</span>
              </button>
              <button class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600 dark:hover:bg-dark-700 dark:hover:text-red-400" @click="handleReject(row)">
                <Icon name="x" size="sm" />
                <span class="text-[10px]">拒绝</span>
              </button>
            </template>
            <button class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-dark-700 dark:hover:text-gray-100" @click="handleView(row)">
              <Icon name="eye" size="sm" />
              <span class="text-[10px]">查看</span>
            </button>
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
    </template>

    <template #pagination>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <label v-if="selectedRows.length > 0" class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" class="rounded border-gray-300 text-primary-600 focus:ring-primary-600" />
            <span>已选择 {{ selectedRows.length }} 项</span>
          </label>
        </div>
        <Pagination
          v-if="total > 0"
          :total="total"
          :page="currentPage"
          :page-size="pageSize"
          @update:page="handlePageChange"
          @update:page-size="handleSizeChange"
        />
      </div>
    </template>
  </TablePageLayout>

  <ConfirmDialog
    :show="showConvertDialog"
    title="转换确认"
    :message="`确定要将订单「${currentRow?.order_number}」转换为施工单？`"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="executeConvert"
    @cancel="showConvertDialog = false"
  />

  <ConfirmDialog
    :show="showBatchConvertDialog"
    title="批量转换确认"
    :message="`确定要将已选的 ${selectedRows.length} 个订单转换为施工单？`"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="executeBatchConvert"
    @cancel="showBatchConvertDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from '@/utils/message'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import { StatusTag, EmptyState, Pagination, Icon, SearchInput, Select, Tag, TablePageLayout, DataTable, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const selectedRows = ref<any[]>([])

const showConvertDialog = ref(false)
const showBatchConvertDialog = ref(false)
const currentRow = ref<any>(null)

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
  { key: 'actions', label: '操作', width: 220, align: 'center', fixed: 'right' }
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

const handleReset = () => { resetFilters() }

const handleAdd = () => { router.push('/sales/create') }
const handleView = (row: any) => { router.push(`/sales/${row.id}`) }
const handleEdit = (row: any) => { router.push(`/sales/${row.id}/edit`) }

const canEdit = (row: any) => row.status === 'draft' && userStore.hasPermission('workorder.change_salesorder')
const canConvert = (row: any) => ['approved', 'in_production'].includes(row.status) && userStore.hasPermission('workorder.add_workorder')

const handleConvertRequest = (row: any) => {
  currentRow.value = row;
  showConvertDialog.value = true;
}

const executeConvert = async () => {
  if (!currentRow.value) return;
  try {
    const response: any = await salesOrderAPI.convertToWorkOrder(currentRow.value.id)
    ElMessage.success('转换成功')
    showConvertDialog.value = false;
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '转换失败') 
  }
}

const handleBatchConvertRequest = () => {
  showBatchConvertDialog.value = true;
}

const executeBatchConvert = async () => {
  if (selectedRows.value.length === 0) return;
  try {
    const orderIds = selectedRows.value.map((r: any) => r.id)
    const response: any = await salesOrderAPI.batchConvertToWorkOrder(orderIds)
    ElMessage.success(`成功转换 ${response.success_count} 个订单`)
    showBatchConvertDialog.value = false;
    selectedRows.value = []
    loadData()
  } catch (error: any) { 
    ErrorHandler.showMessage(error, '批量转换失败') 
  }
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
