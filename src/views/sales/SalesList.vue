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
        <BaseButton
          variant="secondary"
          icon="rotateCcw"
          title="重置筛选"
          @click="handleReset"
        >
          重置
        </BaseButton>
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
        <BaseButton
          v-if="canCreate"
          variant="primary"
          icon="plus"
          @click="handleAdd"
        >
          新建客户订单
        </BaseButton>
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
            :status="['draft', 'submitted', 'rejected'].includes(row.approval_status) ? row.approval_status : row.status"
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
            <Tag
              size="small"
              type="info"
            >{{ row.work_order_count }} 张</Tag>
          </span>
          <span
            v-else
            class="text-gray-400"
          >-</span>
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
import { BaseButton, StatusTag, EmptyState, Pagination, Icon, SearchInput, Select, Tag, TablePageLayout, DataTable, ConfirmDialog, RowActions, FilterRow, TextArea, Input, InputNumber } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

// 操作对话框状态
const rejecting = ref(false)
const paymentLoading = ref(false)
const completeLoading = ref(false)
const cancelLoading = ref(false)
const deleteLoading = ref(false)

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
  { value: 'pending', label: '待处理' },
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
    const apiParams: Record<string, any> = { ...params, ordering }
    if (['draft', 'submitted', 'approved', 'rejected'].includes(apiParams.status)) {
      apiParams.approval_status = apiParams.status
      delete apiParams.status
    }
    return apiParams
  }
})

const canCreate = computed(() => userStore.hasPermission('workorder.add_salesorder'))

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

const canEdit = (row: any) => row.approval_status === 'draft' && userStore.hasPermission('workorder.change_salesorder')
const canConvert = (row: any) => row.approval_status === 'approved' && !['completed', 'cancelled'].includes(row.status) && userStore.hasPermission('workorder.add_workorder')

// 行操作配置
const getRowActions = (row: any): RowAction[] => {
  const status = row.status
  const approval_status = row.approval_status
  const canChange = userStore.hasPermission('workorder.change_salesorder')
  const canApprove = userStore.hasPermission('workorder.approve_salesorder')

  return [
    { key: 'edit', label: '编辑', icon: 'edit', visible: approval_status === 'draft' && canChange },
    { key: 'convert', label: '生成施工单', icon: 'list', tone: 'success', visible: canConvert(row) },
    { key: 'submit', label: '提交', icon: 'upload', tone: 'primary', visible: approval_status === 'draft' },
    { key: 'approve', label: '审核', icon: 'check', tone: 'success', visible: approval_status === 'submitted' && canApprove },
    { key: 'reject', label: '拒绝', icon: 'x', tone: 'danger', visible: approval_status === 'submitted' && canApprove },
    { key: 'updatePayment', label: '更新付款', icon: 'creditCard', tone: 'primary', visible: canChange && approval_status === 'approved' && !['completed', 'cancelled'].includes(status) },
    { key: 'complete', label: '完成', icon: 'checkCircle', tone: 'success', visible: canChange && approval_status === 'approved' && !['completed', 'cancelled'].includes(status) },
    { key: 'cancel', label: '取消', icon: 'xCircle', tone: 'danger', visible: canChange && !['completed', 'cancelled'].includes(status) },
    { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: approval_status === 'draft' && canChange },
    { key: 'view', label: '查看', icon: 'eye' },
  ]
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') handleEdit(row)
  else if (action === 'convert') router.push(`/workorders/create?sales_order_id=${row.id}`)
  else if (action === 'submit') handleSubmit(row)
  else if (action === 'approve') handleApprove(row)
  else if (action === 'reject') handleReject(row)
  else if (action === 'updatePayment') handleUpdatePayment(row)
  else if (action === 'complete') handleComplete(row)
  else if (action === 'cancel') handleCancel(row)
  else if (action === 'delete') handleDelete(row)
  else if (action === 'view') handleView(row)
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
