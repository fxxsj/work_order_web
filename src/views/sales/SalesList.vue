<template>
  <TablePageLayout
    title="客户订单"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="filters.search"
          class="w-full sm:w-64"
          placeholder="搜索订单号/客户名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          class="w-full sm:w-36"
          placeholder="订单状态"
          clearable
          @change="handleSearch"
        />
        <Select
          v-model="filters.payment_status"
          :options="paymentStatusOptions"
          class="w-full sm:w-36"
          placeholder="付款状态"
          clearable
          @change="handleSearch"
        />
        <button
          class="btn btn-secondary"
          @click="handleReset"
        >
          <Icon
            name="rotateCcw"
            size="md"
            class="mr-1"
          />
          重置
        </button>
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button
          :disabled="loading"
          class="btn btn-secondary"
          title="刷新"
          @click="loadData"
        >
          <Icon
            name="refresh"
            size="md"
            :class="loading ? 'animate-spin' : ''"
          />
        </button>
        <button
          class="btn btn-secondary"
          :disabled="!canBatchConvert"
          @click="handleBatchConvertRequest"
        >
          <Icon
            name="list"
            size="md"
            class="mr-2"
          />
          批量转换
        </button>
        <button
          v-if="canCreate"
          class="btn btn-primary"
          @click="handleAdd"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
          新建客户订单
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
        default-sort-key="created_at"
        default-sort-order="desc"
        @sort="handleSort"
        @row-click="handleView"
      >
        <template #cell-selection="{ row }">
          <Checkbox
            :model-value="isSelected(row)"
            @change="toggleSelect(row)"
          />
        </template>

        <template #cell-order_number="{ row }">
          <span
            class="cursor-pointer font-medium text-primary-600 hover:underline dark:text-primary-400"
            @click="handleView(row)"
          >
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
          <Icon
            v-if="isOverdue(row)"
            name="warning"
            class="ml-1 inline h-4 w-4 text-red-600"
          />
        </template>

        <template #cell-total_amount="{ row }">
          <span class="font-medium">¥{{ formatAmount(row.total_amount) }}</span>
        </template>

        <template #cell-status="{ row }">
          <StatusTag
            :status="row.status"
            category="salesOrder"
            effect="plain"
          />
        </template>

        <template #cell-payment_status="{ row }">
          <StatusTag
            :status="row.payment_status"
            category="payment"
            effect="plain"
          />
        </template>

        <template #cell-work_order_count="{ row }">
          <span v-if="row.work_order_count > 0">
            <Tag size="small" type="info">{{ row.work_order_count }} 张</Tag>
          </span>
          <span v-else class="text-gray-400">-</span>
        </template>

        <template #cell-next_step="{ row }">
          <span class="text-xs text-gray-500 dark:text-dark-400">{{ getNextStepHint(row) }}</span>
        </template>

        <template #cell-items_count="{ row }">
          <Tag
            size="small"
            type="info"
          >
            {{ row.items_count || 0 }}
          </Tag>
        </template>

        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>

        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的订单' : '暂无客户订单数据'"
            :action-text="hasFilters ? '重置筛选' : undefined"
            @action="handleReset"
          />
        </template>
      </DataTable>
    </template>

    <template #pagination>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <label
            v-if="selectedRows.length > 0"
            class="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox
              :model-value="allSelected"
              @change="toggleSelectAll"
            />
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

  <!-- 转换施工单 -->
  <ConfirmDialog
    :show="showConvertDialog"
    title="转换确认"
    :message="`确定要将订单「${currentRow?.order_number}」转换为施工单？`"
    confirm-text="确定"
    cancel-text="取消"
    :loading="converting"
    loading-text="转换中..."
    @confirm="executeConvert"
    @cancel="showConvertDialog = false"
  />

  <!-- 批量转换 -->
  <ConfirmDialog
    :show="showBatchConvertDialog"
    title="批量转换确认"
    :message="`确定要将已选的 ${selectedRows.length} 个订单转换为施工单？`"
    confirm-text="确定"
    cancel-text="取消"
    :loading="batchConverting"
    loading-text="转换中..."
    @confirm="executeBatchConvert"
    @cancel="showBatchConvertDialog = false"
  />

  <!-- 审核拒绝 -->
  <ConfirmDialog
    :show="showRejectDialog"
    title="审核拒绝"
    :message="`请填写订单「${currentRow?.order_number || ''}」的拒绝原因。`"
    confirm-text="拒绝"
    cancel-text="取消"
    :danger="true"
    :loading="rejecting"
    loading-text="处理中..."
    @confirm="executeReject"
    @cancel="cancelReject"
  >
    <TextArea
      v-model="rejectReason"
      label="拒绝原因"
      :rows="3"
      placeholder="请输入拒绝原因"
    />
  </ConfirmDialog>

  <!-- 更新付款 -->
  <ConfirmDialog
    :show="showPaymentDialog"
    title="更新付款信息"
    :message="`更新订单「${currentRow?.order_number || ''}」的付款信息`"
    confirm-text="确认"
    cancel-text="取消"
    :loading="paymentLoading"
    loading-text="处理中..."
    @confirm="executePayment"
    @cancel="showPaymentDialog = false"
  >
    <div class="space-y-3">
      <div>
        <label class="input-label mb-1.5 block">已付金额</label>
        <InputNumber
          v-model="paymentAmount"
          :min="0"
          :precision="2"
          class="w-full"
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">付款日期</label>
        <Input
          v-model="paymentDate"
          type="date"
        />
      </div>
    </div>
  </ConfirmDialog>

  <!-- 完成订单 -->
  <ConfirmDialog
    :show="showCompleteDialog"
    title="完成订单"
    :message="`确定要将订单「${currentRow?.order_number || ''}」标记为已完成？`"
    confirm-text="确认完成"
    cancel-text="取消"
    :loading="completeLoading"
    loading-text="处理中..."
    @confirm="executeComplete"
    @cancel="showCompleteDialog = false"
  >
    <TextArea
      v-model="completionReason"
      label="完结原因（可选）"
      :rows="2"
      placeholder="如非全部发货，请填写完结原因"
    />
  </ConfirmDialog>

  <!-- 取消订单 -->
  <ConfirmDialog
    :show="showCancelDialog"
    title="取消订单"
    :message="`确定要取消订单「${currentRow?.order_number || ''}」？取消后相关生产、发货将受影响。`"
    confirm-text="确认取消"
    cancel-text="取消"
    :danger="true"
    :loading="cancelLoading"
    loading-text="处理中..."
    @confirm="executeCancel"
    @cancel="showCancelDialog = false"
  >
    <TextArea
      v-model="cancelReason"
      label="取消原因"
      :rows="2"
      placeholder="请输入取消原因"
    />
  </ConfirmDialog>

  <!-- 删除确认 -->
  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除订单"
    :message="`确定要删除订单「${currentRow?.order_number || ''}」？此操作不可恢复。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    :loading="deleteLoading"
    loading-text="删除中..."
    @confirm="executeDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList } from '@/composables'
import { StatusTag, EmptyState, Pagination, Icon, SearchInput, Select, Tag, TablePageLayout, DataTable, ConfirmDialog, RowActions, FilterRow, Checkbox, TextArea, Input, InputNumber } from '@/components/common'
import type { Column } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

const selectedRows = ref<any[]>([])

// 操作对话框状态
const converting = ref(false)
const batchConverting = ref(false)
const rejecting = ref(false)
const paymentLoading = ref(false)
const completeLoading = ref(false)
const cancelLoading = ref(false)
const deleteLoading = ref(false)

const showConvertDialog = ref(false)
const showBatchConvertDialog = ref(false)
const showRejectDialog = ref(false)
const showPaymentDialog = ref(false)
const showCompleteDialog = ref(false)
const showCancelDialog = ref(false)
const showDeleteDialog = ref(false)

const currentRow = ref<any>(null)
const rejectReason = ref('')
const paymentAmount = ref(0)
const paymentDate = ref('')
const completionReason = ref('')
const cancelReason = ref('')

const columns: Column[] = [
  { key: 'selection', label: '', width: 48, align: 'center' },
  { key: 'order_number', label: '订单号', width: 144, sortable: true },
  { key: 'customer_name', label: '客户名称', width: 144, sortable: true },
  { key: 'order_date', label: '订单日期', width: 112, sortable: true },
  { key: 'delivery_date', label: '交货日期', width: 112, sortable: true },
  { key: 'total_amount', label: '订单金额', width: 112, align: 'right', sortable: true },
  { key: 'status', label: '订单状态', width: 96, align: 'center', sortable: true },
  { key: 'payment_status', label: '付款状态', width: 96, align: 'center', sortable: true },
  { key: 'work_order_count', label: '施工单', width: 80, align: 'center', sortable: true },
  { key: 'next_step', label: '下一步', width: 180 },
  { key: 'items_count', label: '明细数', width: 80, align: 'center', sortable: true },
  { key: 'actions', label: '操作', width: 260, align: 'center', fixed: 'right' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortFieldMap: Record<string, string> = {
  customer_name: 'customer__name'
}

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
} = useCrudList(salesOrderAPI, 'getList', {
  initialFilters: { search: '', status: '', payment_status: '' },
  buildParams: (params) => {
    const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
    const ordering = sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
    return { ...params, ordering }
  }
})

const canCreate = computed(() => userStore.hasPermission('workorder.add_salesorder'))
const canBatchConvert = computed(() => selectedRows.value.some((row: any) => canConvert(row)))

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

const handleReset = () => {
  sortKey.value = 'created_at'
  sortOrder.value = 'desc'
  resetFilters()
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const handleAdd = () => { router.push('/sales-orders/create') }
const handleView = (row: any) => { router.push(`/sales-orders/${row.id}`) }
const handleEdit = (row: any) => { router.push(`/sales-orders/${row.id}/edit`) }

const canEdit = (row: any) => row.status === 'draft' && userStore.hasPermission('workorder.change_salesorder')
const canConvert = (row: any) => ['approved', 'in_production'].includes(row.status) && userStore.hasPermission('workorder.add_workorder')

// 行操作配置
const getRowActions = (row: any) => {
  const status = row.status
  const canChange = userStore.hasPermission('workorder.change_salesorder')
  const canCreateWO = userStore.hasPermission('workorder.add_workorder')
  const canCreateDelivery = userStore.hasPermission('workorder.add_deliveryorder')

  return [
    { key: 'edit', label: '编辑', icon: 'edit', visible: status === 'draft' && canChange },
    { key: 'convert', label: '转换', icon: 'list', tone: 'success', visible: canConvert(row) },
    { key: 'submit', label: '提交', icon: 'upload', tone: 'primary', visible: status === 'draft' },
    { key: 'approve', label: '审核', icon: 'check', tone: 'success', visible: status === 'submitted' },
    { key: 'reject', label: '拒绝', icon: 'x', tone: 'danger', visible: status === 'submitted' },
    { key: 'updatePayment', label: '更新付款', icon: 'creditCard', tone: 'primary', visible: canChange && ['approved', 'in_production'].includes(status) },
    { key: 'complete', label: '完成', icon: 'checkCircle', tone: 'success', visible: canChange && ['approved', 'in_production'].includes(status) },
    { key: 'cancel', label: '取消', icon: 'xCircle', tone: 'danger', visible: canChange && !['completed', 'cancelled', ''].includes(status) },
    { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: status === 'draft' && canChange },
    { key: 'view', label: '查看', icon: 'eye' },
  ]
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') handleEdit(row)
  else if (action === 'convert') handleConvertRequest(row)
  else if (action === 'submit') handleSubmit(row)
  else if (action === 'approve') handleApprove(row)
  else if (action === 'reject') handleReject(row)
  else if (action === 'updatePayment') handleUpdatePayment(row)
  else if (action === 'complete') handleComplete(row)
  else if (action === 'cancel') handleCancel(row)
  else if (action === 'delete') handleDelete(row)
  else if (action === 'view') handleView(row)
}

// 已有操作
const handleConvertRequest = (row: any) => {
  currentRow.value = row;
  showConvertDialog.value = true;
}

const executeConvert = async () => {
  if (!currentRow.value) return;
  try {
    converting.value = true
    const response: any = await salesOrderAPI.convertToWorkOrder(currentRow.value.id)
    useUIStore().showSuccess('转换成功')
    showConvertDialog.value = false;
    router.push(`/workorders/${response.work_order_id || response.id}`)
  } catch (error: any) {
    ErrorHandler.showMessage(error, '转换失败')
  } finally {
    converting.value = false
  }
}

const handleBatchConvertRequest = () => {
  showBatchConvertDialog.value = true;
}

const executeBatchConvert = async () => {
  if (selectedRows.value.length === 0) return;
  const convertibleRows = selectedRows.value.filter((row: any) => canConvert(row))
  if (convertibleRows.length === 0) {
    useUIStore().showWarning('请选择已审核或生产中的订单')
    return
  }
  try {
    batchConverting.value = true
    const orderIds = convertibleRows.map((r: any) => r.id)
    const response: any = await salesOrderAPI.batchConvertToWorkOrder(orderIds)
    const createdCount = Array.isArray(response?.created) ? response.created.length : Number(response?.success_count || 0)
    const failedCount = Array.isArray(response?.failed) ? response.failed.length : Number(response?.failed_count || 0)
    if (createdCount > 0 && failedCount > 0) {
      useUIStore().showWarning(`已转换 ${createdCount} 个订单，${failedCount} 个失败`)
    } else if (createdCount > 0) {
      useUIStore().showSuccess(`成功转换 ${createdCount} 个订单`)
    } else {
      useUIStore().showWarning('没有订单被转换')
    }
    showBatchConvertDialog.value = false;
    selectedRows.value = []
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '批量转换失败')
  } finally {
    batchConverting.value = false
  }
}

const handleSubmit = async (row: any) => {
  try { await salesOrderAPI.submit(row.id); useUIStore().showSuccess('提交成功'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '提交失败') }
}

const handleApprove = async (row: any) => {
  try { await salesOrderAPI.approve(row.id); useUIStore().showSuccess('审核通过'); loadData() } catch (error: any) { ErrorHandler.showMessage(error, '审核失败') }
}

const handleReject = async (row: any) => {
  currentRow.value = row
  rejectReason.value = ''
  showRejectDialog.value = true
}

const cancelReject = () => {
  showRejectDialog.value = false
  rejectReason.value = ''
}

const executeReject = async () => {
  if (!currentRow.value) return
  const reason = rejectReason.value.trim()
  if (!reason) {
    useUIStore().showWarning('请填写拒绝原因')
    return
  }
  try {
    rejecting.value = true
    await salesOrderAPI.reject(currentRow.value.id, { reason })
    useUIStore().showSuccess('已拒绝')
    cancelReject()
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '操作失败')
  } finally {
    rejecting.value = false
  }
}

// 新增操作：更新付款
const handleUpdatePayment = (row: any) => {
  currentRow.value = row
  paymentAmount.value = row.paid_amount || 0
  paymentDate.value = ''
  showPaymentDialog.value = true
}

const executePayment = async () => {
  if (!currentRow.value) return
  try {
    paymentLoading.value = true
    const payload: any = {}
    if (paymentAmount.value >= 0) payload.paid_amount = paymentAmount.value
    if (paymentDate.value) payload.payment_date = paymentDate.value
    await salesOrderAPI.updatePayment(currentRow.value.id, payload)
    useUIStore().showSuccess('付款信息已更新')
    showPaymentDialog.value = false
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '更新失败')
  } finally {
    paymentLoading.value = false
  }
}

// 新增操作：完成订单
const handleComplete = (row: any) => {
  currentRow.value = row
  completionReason.value = ''
  showCompleteDialog.value = true
}

const executeComplete = async () => {
  if (!currentRow.value) return
  try {
    completeLoading.value = true
    const payload: any = {}
    if (completionReason.value.trim()) payload.completion_reason = completionReason.value.trim()
    await salesOrderAPI.complete(currentRow.value.id, payload)
    useUIStore().showSuccess('订单已完成')
    showCompleteDialog.value = false
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '操作失败')
  } finally {
    completeLoading.value = false
  }
}

// 新增操作：取消订单
const handleCancel = (row: any) => {
  currentRow.value = row
  cancelReason.value = ''
  showCancelDialog.value = true
}

const executeCancel = async () => {
  if (!currentRow.value) return
  try {
    cancelLoading.value = true
    const payload: any = {}
    if (cancelReason.value.trim()) payload.reason = cancelReason.value.trim()
    await salesOrderAPI.cancel(currentRow.value.id, payload)
    useUIStore().showSuccess('订单已取消')
    showCancelDialog.value = false
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '操作失败')
  } finally {
    cancelLoading.value = false
  }
}

// 新增操作：删除
const handleDelete = (row: any) => {
  currentRow.value = row
  showDeleteDialog.value = true
}

const executeDelete = async () => {
  if (!currentRow.value) return
  try {
    deleteLoading.value = true
    await salesOrderAPI.delete(currentRow.value.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    loadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除失败')
  } finally {
    deleteLoading.value = false
  }
}

const isOverdue = (row: any) => row.delivery_date && new Date(row.delivery_date) < new Date() && !['completed', 'cancelled'].includes(row.status)
const formatAmount = (amount: any) => amount ? amount.toLocaleString() : '0.00'

const getNextStepHint = (row: any) => {
  const hasWorkOrders = (row.work_order_count || 0) > 0
  switch (row.status) {
    case 'draft': return '待提交确认'
    case 'submitted': return '待业务审核'
    case 'rejected': return '待修改后重提'
    case 'approved': return hasWorkOrders ? '可继续补施工单或直接发货' : '可生成施工单或直接发货'
    case 'in_production': return hasWorkOrders ? '跟进生产进度，可分批发货' : '待补施工单或直接发货'
    case 'completed': return '订单已完结'
    case 'cancelled': return '订单已取消'
    default: return ''
  }
}

onMounted(() => { loadData() })
</script>
