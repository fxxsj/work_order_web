<template>
  <div class="space-y-6">
    <PaymentStats
      :stats="stats"
      :loading="statsLoading"
    />

    <TablePageLayout>
      <template #filters>
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <Select
              v-model="filters.customer"
              :options="customerOptions"
              class="w-full sm:w-36"
              placeholder="选择客户"
              clearable
              filterable
              @change="searchAndRefreshStats"
            />
            <Select
              v-model="filters.payment_method"
              :options="paymentMethodOptions"
              class="w-full sm:w-36"
              placeholder="收款方式"
              clearable
              @change="searchAndRefreshStats"
            />
            <Select
              v-model="filters.todo"
              :options="todoOptions"
              class="w-full sm:w-40"
              placeholder="待办事项"
              clearable
              @change="searchAndRefreshStats"
            />
            <SearchInput
              v-model="searchText"
              class="w-full sm:w-72"
              placeholder="搜索收款单号/客户"
              @search="searchAndRefreshStats"
              @clear="searchAndRefreshStats"
            />
            <input
              v-model="filters.start_date"
              type="date"
              class="input w-36"
              placeholder="开始日期"
              @change="searchAndRefreshStats"
            >
            <input
              v-model="filters.end_date"
              type="date"
              class="input w-36"
              placeholder="结束日期"
              @change="searchAndRefreshStats"
            >
          </div>
        </div>
      </template>
      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            :disabled="loading"
            title="刷新"
            @click="reloadData"
          >
            <Icon
              name="refresh"
              size="md"
              :class="loading ? 'animate-spin' : ''"
            />
          </button>
          <button
            v-if="canCreate"
            class="btn btn-primary"
            @click="handleCreate"
          >
            <Icon
              name="plus"
              size="md"
              class="mr-2"
            />
            新增收款
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
          default-sort-key="payment_date"
          default-sort-order="desc"
          @sort="handleSort"
        >
          <template #cell-payment_number="{ row }">
            <span>{{ row.payment_number }}</span>
          </template>
          <template #cell-customer_name="{ row }">
            <span>{{ row.customer_name }}</span>
          </template>
          <template #cell-payment_date="{ row }">
            <span>{{ row.payment_date }}</span>
          </template>
          <template #cell-payment_method_display="{ row }">
            <span>{{ row.payment_method_display }}</span>
          </template>
          <template #cell-sales_order_number="{ row }">
            <span>{{ row.sales_order_number || '-' }}</span>
          </template>
          <template #cell-invoice_number="{ row }">
            <span>{{ row.invoice_number || '-' }}</span>
          </template>
          <template #cell-amount="{ row }">
            <span>¥{{ row.amount ? row.amount.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-applied_amount="{ row }">
            <span>¥{{ row.applied_amount ? row.applied_amount.toLocaleString() : '0' }}</span>
          </template>
          <template #cell-remaining_amount="{ row }">
            <span :class="getRemainingClass(row)">¥{{ row.remaining_amount ? row.remaining_amount.toLocaleString() : row.amount.toLocaleString() }}</span>
          </template>
          <template #cell-bank_account="{ row }">
            <span class="truncate max-w-xs">{{ row.bank_account }}</span>
          </template>
          <template #cell-notes="{ row }">
            <span class="truncate max-w-xs">{{ row.notes }}</span>
          </template>
          <template #cell-follow_up_text="{ row }">
            <span>{{ row.follow_up_text || '-' }}</span>
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState description="暂无收款数据">
              <template #action>
                <button
                  v-if="hasFilters"
                  class="btn btn-primary"
                  @click="handleReset"
                >
                  重置筛选
                </button>
                <button
                  v-else-if="canCreate"
                  class="btn btn-primary"
                  @click="handleCreate"
                >
                  创建第一笔收款
                </button>
              </template>
            </EmptyState>
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          :page="currentPage"
          :page-size="pageSize"
          :total="total"
          @update:page="handlePageChange"
          @update:page-size="handleSizeChange"
        />
      </template>
    </TablePageLayout>

    <BaseDialog
      :show="detailDialogVisible"
      title="收款详情"
      width="normal"
      @close="detailDialogVisible = false"
    >
      <DescriptionGrid
        v-if="currentPayment"
        :columns="2"
      >
        <DescriptionItem label="收款单号">
          {{ (currentPayment as any).payment_number }}
        </DescriptionItem>
        <DescriptionItem label="客户名称">
          {{ (currentPayment as any).customer_name }}
        </DescriptionItem>
        <DescriptionItem label="收款日期">
          {{ (currentPayment as any).payment_date }}
        </DescriptionItem>
        <DescriptionItem label="付款方式">
          {{ (currentPayment as any).payment_method_display }}
        </DescriptionItem>
        <DescriptionItem label="收款金额">
          ¥{{ (currentPayment as any).amount ? (currentPayment as any).amount.toLocaleString() : '-' }}
        </DescriptionItem>
        <DescriptionItem label="已核销金额">
          ¥{{ (currentPayment as any).applied_amount ? (currentPayment as any).applied_amount.toLocaleString() : '0' }}
        </DescriptionItem>
        <DescriptionItem label="未核销金额">
          ¥{{ (currentPayment as any).remaining_amount ? (currentPayment as any).remaining_amount.toLocaleString() : (currentPayment as any).amount.toLocaleString() }}
        </DescriptionItem>
        <DescriptionItem label="银行账户">
          {{ (currentPayment as any).bank_account || '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="交易流水号"
          :span="2"
        >
          {{ (currentPayment as any).transaction_number || '-' }}
        </DescriptionItem>
        <DescriptionItem label="关联发票">
          {{ (currentPayment as any).invoice_number || '-' }}
        </DescriptionItem>
        <DescriptionItem label="关联销售订单">
          {{ (currentPayment as any).sales_order_number || '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="备注"
          :span="2"
        >
          {{ (currentPayment as any).notes || '-' }}
        </DescriptionItem>
        <DescriptionItem label="创建时间">
          {{ (currentPayment as any).created_at }}
        </DescriptionItem>
        <DescriptionItem label="创建人">
          {{ (currentPayment as any).recorded_by_name || '-' }}
        </DescriptionItem>
      </DescriptionGrid>
      <template #footer>
        <button
          class="btn btn-secondary"
          @click="detailDialogVisible = false"
        >
          关闭
        </button>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="showCreateModal || showEditModal"
      :title="showEditModal ? '编辑收款' : '新增收款'"
      width="normal"
      @close="closeModals"
    >
      <form
        id="payment-form"
        class="space-y-5"
        @submit.prevent="handleSave"
      >
        <div>
          <label class="input-label mb-1.5 block">客户</label>
          <CustomerSelector
            :model-value="form.customer"
            :customers="customerList"
            @update:model-value="value => form.customer = value"
            @create="showQuickCustomerCreate = true"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">收款日期</label>
          <input
            v-model="form.payment_date"
            type="date"
            class="input w-full"
            required
          >
        </div>
        <div>
          <label class="input-label mb-1.5 block">付款方式</label>
          <Select
            v-model="form.payment_method"
            :options="paymentMethodOptions"
            placeholder="请选择付款方式"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">收款金额</label>
          <InputNumber
            v-model="form.amount"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <Input
            v-model="form.bank_account"
            label="银行账户"
            placeholder="请输入银行账户"
            class="w-full"
          />
        </div>
        <div>
          <Input
            v-model="form.transaction_number"
            label="交易流水号"
            placeholder="请输入交易流水号"
            class="w-full"
          />
        </div>
        <div>
          <TextArea
            v-model="form.notes"
            label="备注"
            :rows="3"
            placeholder="请输入备注"
            class="w-full"
          />
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="btn btn-secondary"
            @click="closeModals"
          >
            取消
          </button>
          <button
            form="payment-form"
            type="submit"
            class="btn btn-primary"
            :disabled="submitting"
          >
            <svg
              v-if="submitting"
              class="-ml-1 mr-2 h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ submitting ? '保存中...' : (showEditModal ? '更新' : '保存') }}
          </button>
        </div>
      </template>
    </BaseDialog>

    <ConfirmDialog
      :show="showDeleteDialog"
      title="删除确认"
      :message="`确定要删除收款记录「${selectedRowForDelete?.payment_number}」吗？此操作不可撤销。`"
      confirm-text="删除"
      cancel-text="取消"
      :danger="true"
      :loading="deleting"
      loading-text="删除中..."
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
    <QuickCustomerCreateDialog
      v-model:visible="showQuickCustomerCreate"
      @created="handleCustomerCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUIStore } from '@/stores/ui'
import { paymentAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import PaymentStats from './components/PaymentStats.vue'
import { Select, Input, TextArea, InputNumber, TablePageLayout, DataTable, EmptyState, Pagination, Icon, BaseDialog, ConfirmDialog, DescriptionGrid, DescriptionItem, RowActions, SearchInput } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import CustomerSelector from '@/views/customer/components/CustomerSelector.vue'
import QuickCustomerCreateDialog from '@/views/customer/components/QuickCustomerCreateDialog.vue'

const { canCreate, canEdit, canDelete } = useCrudPermission('payment')

const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref<any[]>([])
const currentPayment = ref(null)
const stats = ref({})

// Modals state
const detailDialogVisible = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const showQuickCustomerCreate = ref(false)
const deleting = ref(false)
const selectedRowForDelete = ref<any>(null)
const sortKey = ref('payment_date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortFieldMap: Record<string, string> = {
  customer_name: 'customer__name',
  payment_method_display: 'payment_method',
  sales_order_number: 'sales_order__order_number',
  invoice_number: 'invoice__invoice_number'
}

const FORM_INITIAL: Record<string, any> = { id: undefined, customer: undefined, payment_date: '', payment_method: '', amount: undefined, bank_account: '', transaction_number: '', notes: '' }
const form = reactive({ ...FORM_INITIAL })

const columns: Column[] = [
  { key: 'payment_number', label: '收款单号', width: 144, sortable: true },
  { key: 'customer_name', label: '客户名称', width: 144, sortable: true },
  { key: 'payment_date', label: '收款日期', width: 112, sortable: true },
  { key: 'payment_method_display', label: '收款方式', width: 96, sortable: true },
  { key: 'sales_order_number', label: '销售订单', width: 128, sortable: true },
  { key: 'invoice_number', label: '关联发票', width: 128, sortable: true },
  { key: 'amount', label: '收款金额', width: 112, align: 'right', sortable: true },
  { key: 'applied_amount', label: '已核销金额', width: 112, align: 'right', sortable: true },
  { key: 'remaining_amount', label: '未核销金额', width: 112, align: 'right', sortable: true },
  { key: 'follow_up_text', label: '下一步', width: 144 },
  { key: 'bank_account', label: '银行账户', minWidth: 144 },
  { key: 'notes', label: '备注', minWidth: 144 },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

// Computed options for native Select
const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const paymentMethodOptions = [
  { value: 'cash', label: '现金' },
  { value: 'transfer', label: '转账' },
  { value: 'check', label: '支票' },
  { value: 'acceptance', label: '承兑汇票' }
]
const todoOptions = [
  { value: 'pending_writeoff', label: '待核销' },
  { value: 'missing_invoice_link', label: '待关联发票' }
]

const buildPaymentParams = (params: any) => {
  const { date_range, ...nextParams } = params
  if (date_range?.length === 2) {
    nextParams.start_date = date_range[0]
    nextParams.end_date = date_range[1]
  }
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  nextParams.ordering = sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  return nextParams
}

const {
  searchText,
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  hasFilters,
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(paymentAPI, 'getList', {
  initialFilters: { customer: '', payment_method: '', todo: '', start_date: '', end_date: '', date_range: null },
  buildParams: buildPaymentParams
})

const handleReset = async () => {
  await resetFilters()
  fetchStats()
}

const searchAndRefreshStats = async () => {
  await handleSearch()
  fetchStats()
}

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await paymentAPI.getSummary(buildPaymentParams({
      search: searchText.value,
      customer: filters.value.customer,
      payment_method: filters.value.payment_method,
      todo: filters.value.todo,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    }))
    const payload = response?.data || response
    const summary = payload?.summary || {}
    stats.value = {
      total_amount: summary.total_amount || 0,
      applied_amount: summary.applied_amount || 0,
      unapplied_amount: summary.remaining_amount || 0,
      total_count: summary.total_count || 0,
      pending_writeoff_count: summary.pending_writeoff_count || 0,
      missing_invoice_link_count: summary.missing_invoice_link_count || 0
    }
  } catch (error: any) { stats.value = {} } finally { statsLoading.value = false }
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
  fetchStats()
}

const reloadData = async () => {
  await loadData()
  fetchStats()
}

const fetchCustomers = async () => {
  try {
    const response: any = await customerAPI.getList({ page_size: 50 })
    const list = Array.isArray(response) ? response : (response?.results || response?.data || [])
    customerList.value = list
  } catch (error: any) {}
}

const handleCustomerCreated = (customer: any) => {
  customerList.value.push(customer)
  form.customer = customer.id
}

const handleView = async (row: any) => {
  try { currentPayment.value = row; detailDialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '获取收款详情失败') }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
}

const handleCreate = () => { 
  if (!canCreate.value) return
  Object.assign(form, FORM_INITIAL)
  showCreateModal.value = true
}

const handleEdit = (row: any) => {
  if (!canEdit.value) return
  Object.assign(form, { id: row.id, customer: row.customer, payment_date: row.payment_date, payment_method: row.payment_method, amount: row.amount, bank_account: row.bank_account || '', transaction_number: row.transaction_number || '', notes: row.notes || '' })
  showEditModal.value = true
}

const confirmDelete = (row: any) => {
  selectedRowForDelete.value = row
  showDeleteDialog.value = true
}

const handleDelete = async () => {
  try {
    deleting.value = true
    const row = selectedRowForDelete.value
    if (!row) return
    await paymentAPI.delete(row.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    reloadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, '删除失败') }
  finally { deleting.value = false }
}

const handleSave = async () => {
  if (!form.customer) { useUIStore().showWarning('请选择客户'); return }
  if (!form.payment_date) { useUIStore().showWarning('请选择收款日期'); return }
  if (!form.payment_method) { useUIStore().showWarning('请选择付款方式'); return }
  if (!form.amount) { useUIStore().showWarning('请输入收款金额'); return }
  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) { 
      delete (data as any).id
      delete (data as any).customer
      await paymentAPI.update(form.id!, data)
      useUIStore().showSuccess('更新成功') 
    } else { 
      await paymentAPI.create(data)
      useUIStore().showSuccess('创建成功') 
    }
    closeModals()
    reloadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, showEditModal.value ? '更新失败' : '创建失败') } finally { submitting.value = false }
}

const getRemainingClass = (row: any) => {
  const remaining = row.remaining_amount || row.amount
  if (remaining > 0) return 'text-warning'
  return 'text-success'
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'edit': handleEdit(row); break
    case 'delete': confirmDelete(row); break
  }
}

onMounted(() => { reloadData(); fetchCustomers() })
</script>
