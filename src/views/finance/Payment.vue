<template>
  <div class="space-y-6">
    <PaymentStats :stats="stats" :loading="statsLoading" />

    <CrudPageLayout
      title="收款管理"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #search>
        <Select v-model="filters.customer" :options="customerOptions" class="w-40" placeholder="选择客户" clearable filterable @change="handleSearch" />
        <Select v-model="filters.payment_method" :options="paymentMethodOptions" class="w-36" placeholder="付款方式" clearable @change="handleSearch" />
        <input type="date" v-model="filters.start_date" class="input w-36" placeholder="开始日期" @change="handleSearch" />
        <input type="date" v-model="filters.end_date" class="input w-36" placeholder="结束日期" @change="handleSearch" />
      </template>
      <template #actions>
        <button class="btn" :disabled="loading" @click="loadData">刷新</button>
        <button class="btn btn-primary" v-if="canCreate" @click="handleCreate">新增收款</button>
      </template>

      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
        <template #cell-payment_number="{ row }"><span>{{ row.payment_number }}</span></template>
        <template #cell-customer_name="{ row }"><span>{{ row.customer_name }}</span></template>
        <template #cell-payment_date="{ row }"><span>{{ row.payment_date }}</span></template>
        <template #cell-payment_method_display="{ row }"><span>{{ row.payment_method_display }}</span></template>
        <template #cell-amount="{ row }"><span>¥{{ row.amount ? row.amount.toLocaleString() : '-' }}</span></template>
        <template #cell-applied_amount="{ row }"><span>¥{{ row.applied_amount ? row.applied_amount.toLocaleString() : '0' }}</span></template>
        <template #cell-remaining_amount="{ row }"><span :class="getRemainingClass(row)">¥{{ row.remaining_amount ? row.remaining_amount.toLocaleString() : row.amount.toLocaleString() }}</span></template>
        <template #cell-bank_account="{ row }"><span class="truncate max-w-xs">{{ row.bank_account }}</span></template>
        <template #cell-notes="{ row }"><span class="truncate max-w-xs">{{ row.notes }}</span></template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" @click="handleView(row)">查看</button>
            <button class="btn btn-ghost btn-sm" v-if="canEdit" @click="handleEdit(row)">编辑</button>
            <button class="btn btn-ghost btn-sm text-danger" v-if="canDelete" @click="handleDelete(row)">删除</button>
          </div>
        </template>
        <template #empty>
          <EmptyState description="暂无收款数据">
            <template #action>
              <button class="btn btn-primary" v-if="hasFilters" @click="handleReset">重置筛选</button>
              <button class="btn btn-primary" v-else-if="canCreate" @click="handleCreate">创建第一笔收款</button>
            </template>
          </EmptyState>
        </template>
      </DataTable>
    </CrudPageLayout>

    <BaseDialog :show="detailDialogVisible" title="收款详情" width="normal">
      <div v-if="currentPayment" class="descriptions-grid" style="--col: 2">
        <div class="description-item"><div class="description-label">收款单号</div><div class="description-value">{{ (currentPayment as any).payment_number }}</div></div>
        <div class="description-item"><div class="description-label">客户名称</div><div class="description-value">{{ (currentPayment as any).customer_name }}</div></div>
        <div class="description-item"><div class="description-label">收款日期</div><div class="description-value">{{ (currentPayment as any).payment_date }}</div></div>
        <div class="description-item"><div class="description-label">付款方式</div><div class="description-value">{{ (currentPayment as any).payment_method_display }}</div></div>
        <div class="description-item"><div class="description-label">收款金额</div><div class="description-value">¥{{ (currentPayment as any).amount ? (currentPayment as any).amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">已核销金额</div><div class="description-value">¥{{ (currentPayment as any).applied_amount ? (currentPayment as any).applied_amount.toLocaleString() : '0' }}</div></div>
        <div class="description-item"><div class="description-label">未核销金额</div><div class="description-value">¥{{ (currentPayment as any).remaining_amount ? (currentPayment as any).remaining_amount.toLocaleString() : (currentPayment as any).amount.toLocaleString() }}</div></div>
        <div class="description-item"><div class="description-label">银行账户</div><div class="description-value">{{ (currentPayment as any).bank_account || '-' }}</div></div>
        <div class="description-item col-span-2"><div class="description-label">交易流水号</div><div class="description-value">{{ (currentPayment as any).transaction_number || '-' }}</div></div>
        <div class="description-item"><div class="description-label">关联发票</div><div class="description-value">{{ (currentPayment as any).invoice_number || '-' }}</div></div>
        <div class="description-item"><div class="description-label">关联销售订单</div><div class="description-value">{{ (currentPayment as any).sales_order_number || '-' }}</div></div>
        <div class="description-item col-span-2"><div class="description-label">备注</div><div class="description-value">{{ (currentPayment as any).notes || '-' }}</div></div>
        <div class="description-item"><div class="description-label">创建时间</div><div class="description-value">{{ (currentPayment as any).created_at }}</div></div>
        <div class="description-item"><div class="description-label">创建人</div><div class="description-value">{{ (currentPayment as any).recorded_by_name || '-' }}</div></div>
      </div>
      <template #footer><button class="btn" @click="detailDialogVisible = false">关闭</button></template>
    </BaseDialog>

    <BaseDialog :show="formDialogVisible" :title="isEdit ? '编辑收款' : '新增收款'" width="normal">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">客户</label>
          <Select v-model="form.customer" :options="customerOptions" placeholder="请选择客户" filterable class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">收款日期</label>
          <input type="date" v-model="form.payment_date" class="input flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">付款方式</label>
          <Select v-model="form.payment_method" :options="paymentMethodOptions" placeholder="请选择付款方式" class="flex-1" />
        </div>
        <InputNumber v-model="form.amount" label="收款金额" :min="0" :precision="2" class="w-full" />
        <Input v-model="form.bank_account" label="银行账户" placeholder="请输入银行账户" class="w-full" />
        <Input v-model="form.transaction_number" label="交易流水号" placeholder="请输入交易流水号" class="w-full" />
        <TextArea v-model="form.notes" label="备注" :rows="3" placeholder="请输入备注" class="w-full" />
      </div>
      <template #footer>
        <button class="btn" @click="formDialogVisible = false">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handleSave">保存</button>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/message'
import { paymentAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import PaymentStats from './components/PaymentStats.vue'
import { Select, Input, TextArea, InputNumber, CrudPageLayout, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common/types'

const { canCreate, canEdit, canDelete } = useCrudPermission('payment')

const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref<any[]>([])
const currentPayment = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)

const FORM_INITIAL: Record<string, any> = { id: undefined, customer: undefined, payment_date: '', payment_method: '', amount: undefined, bank_account: '', transaction_number: '', notes: '' }
const form = reactive({ ...FORM_INITIAL })

const columns: Column[] = [
  { key: 'payment_number', label: '收款单号', width: 144 },
  { key: 'customer_name', label: '客户名称', width: 144 },
  { key: 'payment_date', label: '收款日期', width: 112 },
  { key: 'payment_method_display', label: '付款方式', width: 96 },
  { key: 'amount', label: '收款金额', width: 112, align: 'right' },
  { key: 'applied_amount', label: '已核销金额', width: 112, align: 'right' },
  { key: 'remaining_amount', label: '未核销金额', width: 112, align: 'right' },
  { key: 'bank_account', label: '银行账户', minWidth: 144 },
  { key: 'notes', label: '备注', minWidth: 144 },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

// Computed options for native Select
const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const paymentMethodOptions = [
  { value: 'cash', label: '现金' },
  { value: 'bank_transfer', label: '银行转账' },
  { value: 'check', label: '支票' },
  { value: 'other', label: '其他' }
]

const buildPaymentParams = (params: any) => {
  const { date_range, ...nextParams } = params
  if (date_range?.length === 2) {
    nextParams.start_date = date_range[0]
    nextParams.end_date = date_range[1]
  }
  return nextParams
}

const {
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
  initialFilters: { customer: '', payment_method: '', date_range: null },
  buildParams: buildPaymentParams
})

const handleReset = () => resetFilters()

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await paymentAPI.getSummary()
    const payload = response?.data || response
    const summary = payload?.summary || {}
    stats.value = { total_amount: summary.total_amount || 0, applied_amount: summary.applied_amount || 0, unapplied_amount: summary.remaining_amount || 0, total_count: summary.total_count || 0 }
  } catch (error: any) { stats.value = {} } finally { statsLoading.value = false }
}

const fetchCustomers = async () => {
  try {
    const response: any = await customerAPI.getList({ page_size: 1000 })
    customerList.value = response?.results || []
  } catch (error: any) {}
}

const handleView = async (row: any) => {
  try { currentPayment.value = row; detailDialogVisible.value = true } catch (error: any) { ErrorHandler.showMessage(error, '获取收款详情失败') }
}

const handleCreate = () => { if (!canCreate.value) return; isEdit.value = false; Object.assign(form, FORM_INITIAL); formDialogVisible.value = true }

const handleEdit = (row: any) => {
  if (!canEdit.value) return
  isEdit.value = true
  Object.assign(form, { id: row.id, customer: row.customer, payment_date: row.payment_date, payment_method: row.payment_method, amount: row.amount, bank_account: row.bank_account || '', transaction_number: row.transaction_number || '', notes: row.notes || '' })
  formDialogVisible.value = true
}

const handleDelete = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm(`确定要删除收款记录"${row.payment_number}"吗？`)
    if (!confirmed) return
    await paymentAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadData()
    fetchStats()
  } catch (error: any) { if (error !== 'cancel') ErrorHandler.showMessage(error, '删除失败') }
}

const handleSave = async () => {
  if (!form.customer) { ElMessage.warning('请选择客户'); return }
  if (!form.payment_date) { ElMessage.warning('请选择收款日期'); return }
  if (!form.payment_method) { ElMessage.warning('请选择付款方式'); return }
  if (!form.amount) { ElMessage.warning('请输入收款金额'); return }
  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) { delete (data as any).id; await paymentAPI.update(form.id!, data); ElMessage.success('更新成功') }
    else { await paymentAPI.create(data); ElMessage.success('创建成功') }
    formDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error: any) { ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败') } finally { submitting.value = false }
}

const getRemainingClass = (row: any) => {
  const remaining = row.remaining_amount || row.amount
  if (remaining > 0) return 'text-warning'
  return 'text-success'
}

onMounted(() => { loadData(); fetchStats(); fetchCustomers() })
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.payment-container { padding: var(--ui-page-padding); }
.header-section { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.filter-group, .action-group { display: flex; align-items: center; flex-wrap: wrap; gap: var(--ui-control-gap); }
.finance-filter-control { width: min(100%, var(--ui-filter-control-width)); }
.finance-date-control { width: min(100%, var(--ui-date-range-control-width)); }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.finance-table { width: 100%; }
.text-warning { color: var(--ui-color-warning); }
.text-success { color: var(--ui-color-success); }
.card { border-radius: var(--ui-radius-card); box-shadow: var(--ui-shadow-card); }

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .finance-filter-control,
  .finance-date-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
