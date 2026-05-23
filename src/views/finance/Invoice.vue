<template>
  <div class="space-y-6">
    <InvoiceStats :stats="stats" :loading="statsLoading" />

    <CrudPageLayout
      title="发票管理"
      :loading="loading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
    >
      <template #search>
        <Select v-model="filters.customer" :options="customerOptions" class="w-40" placeholder="选择客户" clearable filterable @change="handleSearch" />
        <Select v-model="filters.status" :options="statusOptions" class="w-36" placeholder="发票状态" clearable @change="handleSearch" />
        <SearchInput v-model="filters.invoice_number" placeholder="搜索发票号码" @search="handleSearch" @clear="handleSearch" />
      </template>
      <template #actions>
        <button class="btn" :disabled="loading" @click="loadData">刷新</button>
        <button class="btn btn-primary" v-if="canCreate" @click="handleCreate">新建发票</button>
      </template>

      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id">
        <template #cell-invoice_number="{ row }"><span>{{ row.invoice_number }}</span></template>
        <template #cell-invoice_type_display="{ row }"><span>{{ row.invoice_type_display }}</span></template>
        <template #cell-customer_name="{ row }"><span>{{ row.customer_name }}</span></template>
        <template #cell-amount="{ row }"><span>¥{{ row.amount ? row.amount.toLocaleString() : '-' }}</span></template>
        <template #cell-tax_amount="{ row }"><span>¥{{ row.tax_amount ? row.tax_amount.toLocaleString() : '-' }}</span></template>
        <template #cell-total_amount="{ row }"><span>¥{{ row.total_amount ? row.total_amount.toLocaleString() : '-' }}</span></template>
        <template #cell-issue_date="{ row }"><span>{{ row.issue_date }}</span></template>
        <template #cell-status="{ row }"><StatusTag :status="row.status" category="invoice" :label="row.status_display" /></template>
        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button class="btn btn-ghost btn-sm" @click="handleView(row)">查看</button>
            <button class="btn btn-ghost btn-sm" v-if="canEdit && row.status === 'draft'" @click="handleEdit(row)">编辑</button>
            <button class="btn btn-ghost btn-sm text-warning" v-if="canEdit && row.status === 'draft'" @click="handleSubmit(row)">提交</button>
          </div>
        </template>
        <template #empty>
          <EmptyState description="暂无发票数据">
            <template #action>
              <button class="btn btn-primary" v-if="hasFilters" @click="handleReset">重置筛选</button>
              <button class="btn btn-primary" v-else-if="canCreate" @click="handleCreate">创建第一个发票</button>
            </template>
          </EmptyState>
        </template>
      </DataTable>
    </CrudPageLayout>

    <BaseDialog :show="detailDialogVisible" title="发票详情" width="wide">
      <div v-if="currentInvoice" class="descriptions-grid" style="--col: 2">
        <div class="description-item"><div class="description-label">发票号码</div><div class="description-value">{{ (currentInvoice as any).invoice_number }}</div></div>
        <div class="description-item"><div class="description-label">发票类型</div><div class="description-value">{{ (currentInvoice as any).invoice_type_display }}</div></div>
        <div class="description-item"><div class="description-label">客户名称</div><div class="description-value">{{ (currentInvoice as any).customer_name }}</div></div>
        <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="(currentInvoice as any).status" category="invoice" :label="(currentInvoice as any).status_display" /></div></div>
        <div class="description-item"><div class="description-label">金额(不含税)</div><div class="description-value">¥{{ (currentInvoice as any).amount ? (currentInvoice as any).amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">税率</div><div class="description-value">{{ (currentInvoice as any).tax_rate }}%</div></div>
        <div class="description-item"><div class="description-label">税额</div><div class="description-value">¥{{ (currentInvoice as any).tax_amount ? (currentInvoice as any).tax_amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">价税合计</div><div class="description-value">¥{{ (currentInvoice as any).total_amount ? (currentInvoice as any).total_amount.toLocaleString() : '-' }}</div></div>
        <div class="description-item"><div class="description-label">开票日期</div><div class="description-value">{{ (currentInvoice as any).issue_date || '-' }}</div></div>
        <div class="description-item col-span-2"><div class="description-label">关联单号</div><div class="description-value">{{ (currentInvoice as any).sales_order_number || (currentInvoice as any).work_order_number || '-' }}</div></div>
        <div class="description-item col-span-2"><div class="description-label">备注</div><div class="description-value">{{ (currentInvoice as any).notes || '-' }}</div></div>
      </div>
      <template #footer>
        <button class="btn" @click="detailDialogVisible = false">关闭</button>
      </template>
    </BaseDialog>

    <BaseDialog :show="formDialogVisible" :title="isEdit ? '编辑发票' : '新建发票'" width="normal">
      <div class="space-y-4">
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">客户</label>
          <Select v-model="form.customer" :options="customerOptions" placeholder="请选择客户" filterable class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">发票类型</label>
          <Select v-model="form.invoice_type" :options="invoiceTypeOptions" placeholder="请选择发票类型" class="flex-1" />
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">开票日期</label>
          <input type="date" v-model="form.issue_date" class="input flex-1" />
        </div>
        <InputNumber v-model="form.amount" label="金额(不含税)" :min="0" :precision="2" class="w-full" />
        <InputNumber v-model="form.tax_rate" label="税率" :min="0" :max="100" class="w-full" />
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
import { invoiceAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, SearchInput, Icon, Input, TextArea, InputNumber, CrudPageLayout, DataTable, EmptyState } from '@/components/common'
import type { Column } from '@/components/common/types'
import InvoiceStats from './components/InvoiceStats.vue'

const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref<any[]>([])
const currentInvoice = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)

const FORM_INITIAL: Record<string, any> = {
  id: undefined,
  customer: undefined,
  invoice_type: 'vat_special',
  issue_date: '',
  amount: undefined,
  tax_rate: 13,
  notes: ''
}

const form = reactive({ ...FORM_INITIAL })

const columns: Column[] = [
  { key: 'invoice_number', label: '发票号码', width: 144 },
  { key: 'invoice_type_display', label: '发票类型', width: 112 },
  { key: 'customer_name', label: '客户名称', width: 144 },
  { key: 'amount', label: '金额(不含税)', width: 112, align: 'right' },
  { key: 'tax_amount', label: '税额', width: 96, align: 'right' },
  { key: 'total_amount', label: '价税合计', width: 112, align: 'right' },
  { key: 'issue_date', label: '开票日期', width: 112 },
  { key: 'status', label: '状态', width: 96 },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

// Computed options for native Select
const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const invoiceTypeOptions = [
  { value: 'vat_special', label: '增值税专用发票' },
  { value: 'vat_common', label: '增值税普通发票' },
  { value: 'electronic', label: '电子发票' }
]
const statusOptions = [
  { value: 'draft', label: '待开具' },
  { value: 'issued', label: '已开具' },
  { value: 'sent', label: '已发送' },
  { value: 'received', label: '已收到' },
  { value: 'cancelled', label: '已作废' },
  { value: 'refunded', label: '已红冲' }
]

const buildInvoiceParams = (params: any) => {
  const { invoice_number, ...nextParams } = params
  if (invoice_number) nextParams.search = invoice_number
  return nextParams
}

const {
  filters,
  tableData,
  loading,
  total,
  currentPage,
  pageSize,
  loadData,
  handleSearch,
  handleSearchDebounced,
  handlePageChange,
  handleSizeChange,
  resetFilters
} = useCrudList(invoiceAPI, 'getList', {
  initialFilters: { status: '', customer: '', invoice_number: '' },
  buildParams: buildInvoiceParams
})

const hasFilters = computed(() => filters.value.status || filters.value.customer || filters.value.invoice_number)
const { canCreate, canEdit } = useCrudPermission('invoice')

const handleReset = () => resetFilters()

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await invoiceAPI.getSummary()
    const payload = response?.data || response
    const summary = payload?.summary || {}
    const byStatus = payload?.by_status || []

    let pendingAmount = 0
    let receivedAmount = 0
    try {
      const listResponse: any = await invoiceAPI.getList({ page_size: 1000 })
      const list = listResponse?.results || []
      pendingAmount = list.filter((i: any) => i.status === 'issued' || i.status === 'sent').reduce((sum: any, i: any) => sum + (i.total_amount || 0), 0)
      receivedAmount = list.filter((i: any) => i.status === 'received').reduce((sum: any, i: any) => sum + (i.total_amount || 0), 0)
    } catch (e: any) {}

    stats.value = {
      total_count: summary.total_count || 0,
      draft_count: byStatus.find((row: any) => row.status === 'draft')?.count || 0,
      pending_amount: pendingAmount,
      received_amount: receivedAmount
    }
  } catch (error: any) {
    stats.value = {}
  } finally {
    statsLoading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const response: any = await customerAPI.getList({ page_size: 1000 })
    customerList.value = response?.results || []
  } catch (error: any) {}
}

const handleView = async (row: any) => {
  try {
    const response: any = await invoiceAPI.getDetail(row.id)
    currentInvoice.value = response
    detailDialogVisible.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '获取发票详情失败')
  }
}

const handleCreate = () => {
  if (!canCreate.value) return
  isEdit.value = false
  Object.assign(form, FORM_INITIAL)
  formDialogVisible.value = true
}

const handleEdit = (row: any) => {
  if (!canEdit.value) return
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    customer: row.customer,
    invoice_type: row.invoice_type,
    issue_date: row.issue_date,
    amount: row.amount,
    tax_rate: row.tax_rate,
    notes: row.notes || ''
  })
  formDialogVisible.value = true
}

const handleSubmit = async (row: any) => {
  try {
    const confirmed = await ErrorHandler.confirm('确认提交该发票？')
    if (!confirmed) return
    await invoiceAPI.submit(row.id)
    ElMessage.success('提交成功')
    loadData()
    fetchStats()
  } catch (error: any) {
    if (error !== 'cancel') {
      ErrorHandler.showMessage(error, '提交失败')
    }
  }
}

const handleSave = async () => {
  if (!form.customer) { ElMessage.warning('请选择客户'); return }
  if (!form.invoice_type) { ElMessage.warning('请选择发票类型'); return }
  if (!form.issue_date) { ElMessage.warning('请选择开票日期'); return }
  if (!form.amount) { ElMessage.warning('请输入金额'); return }

  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) {
      delete (data as any).id
      await invoiceAPI.update(form.id!, data)
      ElMessage.success('发票更新成功')
    } else {
      await invoiceAPI.create(data)
      ElMessage.success('发票创建成功')
    }
    formDialogVisible.value = false
    loadData()
    fetchStats()
  } catch (error: any) {
    ErrorHandler.showMessage(error, isEdit.value ? '更新发票失败' : '创建发票失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
  fetchStats()
  fetchCustomers()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.invoice-container {
  padding: var(--ui-page-padding);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.filter-group,
.action-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ui-control-gap);
}

.finance-filter-control {
  width: min(100%, var(--ui-filter-control-width));
}

.finance-search-control {
  width: min(100%, var(--ui-search-control-width));
}

.table-scroll {
  margin-top: var(--ui-section-gap);
  overflow-x: auto;
}

.finance-table {
  width: 100%;
}

.card {
  border-radius: var(--ui-radius-card);
  box-shadow: var(--ui-shadow-card);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .header-section,
  .filter-group,
  .action-group,
  .finance-filter-control,
  .finance-search-control {
    align-items: stretch;
    width: 100%;
  }

  .filter-group,
  .action-group {
    flex-direction: column;
  }
}
</style>
