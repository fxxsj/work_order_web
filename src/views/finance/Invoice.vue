<template>
  <div class="space-y-6">
    <InvoiceStats
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
              class="w-40"
              placeholder="选择客户"
              clearable
              filterable
              @change="handleSearch"
            />
            <Select
              v-model="filters.status"
              :options="statusOptions"
              class="w-36"
              placeholder="发票状态"
              clearable
              @change="handleSearch"
            />
            <SearchInput
              v-model="filters.invoice_number"
              placeholder="搜索发票号码"
              @search="handleSearch"
              @clear="handleSearch"
            />
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex justify-end gap-3">
          <button
            class="btn btn-secondary"
            :disabled="loading"
            @click="loadData"
          >
            <Icon
              name="refresh"
              size="md"
              :class="loading ? 'animate-spin' : ''"
            />
            刷新
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
            新建发票
          </button>
        </div>
      </template>

      <template #table>
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          row-key="id"
        >
          <template #cell-invoice_number="{ row }">
            <span>{{ row.invoice_number }}</span>
          </template>
          <template #cell-invoice_type_display="{ row }">
            <span>{{ row.invoice_type_display }}</span>
          </template>
          <template #cell-customer_name="{ row }">
            <span>{{ row.customer_name }}</span>
          </template>
          <template #cell-amount="{ row }">
            <span>¥{{ row.amount ? row.amount.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-tax_amount="{ row }">
            <span>¥{{ row.tax_amount ? row.tax_amount.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-total_amount="{ row }">
            <span>¥{{ row.total_amount ? row.total_amount.toLocaleString() : '-' }}</span>
          </template>
          <template #cell-issue_date="{ row }">
            <span>{{ row.issue_date }}</span>
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="invoice"
              :label="row.status_display"
            />
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="(action) => handleRowAction(action, row)"
            />
          </template>
          <template #empty>
            <EmptyState description="暂无发票数据">
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
                  创建第一个发票
                </button>
              </template>
            </EmptyState>
          </template>
        </DataTable>
      </template>

      <template #pagination>
        <Pagination
          v-if="total > 0"
          v-model:page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          @update:page-size="handleSizeChange"
          @update:page="handlePageChange"
        />
      </template>
    </TablePageLayout>

    <BaseDialog
      :show="detailDialogVisible"
      title="发票详情"
      width="wide"
      @close="detailDialogVisible = false"
    >
      <DescriptionGrid
        v-if="currentInvoice"
        :columns="2"
      >
        <DescriptionItem label="发票号码">
          {{ (currentInvoice as any).invoice_number }}
        </DescriptionItem>
        <DescriptionItem label="发票类型">
          {{ (currentInvoice as any).invoice_type_display }}
        </DescriptionItem>
        <DescriptionItem label="客户名称">
          {{ (currentInvoice as any).customer_name }}
        </DescriptionItem>
        <DescriptionItem label="状态">
          <StatusTag
            :status="(currentInvoice as any).status"
            category="invoice"
            :label="(currentInvoice as any).status_display"
          />
        </DescriptionItem>
        <DescriptionItem label="金额(不含税)">
          ¥{{ (currentInvoice as any).amount ? (currentInvoice as any).amount.toLocaleString() : '-' }}
        </DescriptionItem>
        <DescriptionItem label="税率">
          {{ (currentInvoice as any).tax_rate }}%
        </DescriptionItem>
        <DescriptionItem label="税额">
          ¥{{ (currentInvoice as any).tax_amount ? (currentInvoice as any).tax_amount.toLocaleString() : '-' }}
        </DescriptionItem>
        <DescriptionItem label="价税合计">
          ¥{{ (currentInvoice as any).total_amount ? (currentInvoice as any).total_amount.toLocaleString() : '-' }}
        </DescriptionItem>
        <DescriptionItem label="开票日期">
          {{ (currentInvoice as any).issue_date || '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="关联单号"
          :span="2"
        >
          {{ (currentInvoice as any).sales_order_number || (currentInvoice as any).work_order_number || '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="备注"
          :span="2"
        >
          {{ (currentInvoice as any).notes || '-' }}
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
      :show="formDialogVisible"
      :title="isEdit ? '编辑发票' : '新建发票'"
      width="normal"
      @close="formDialogVisible = false"
    >
      <form
        id="invoice-form"
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
          <label class="input-label mb-1.5 block">发票类型</label>
          <Select
            v-model="form.invoice_type"
            :options="invoiceTypeOptions"
            placeholder="请选择发票类型"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">开票日期</label>
          <input
            v-model="form.issue_date"
            type="date"
            class="input w-full"
          >
        </div>
        <div>
          <label class="input-label mb-1.5 block">金额(不含税)</label>
          <InputNumber
            v-model="form.amount"
            :min="0"
            :precision="2"
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">税率</label>
          <InputNumber
            v-model="form.tax_rate"
            :min="0"
            :max="100"
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
            class="btn btn-secondary"
            type="button"
            @click="formDialogVisible = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            form="invoice-form"
            type="submit"
            :disabled="submitting"
          >
            保存
          </button>
        </div>
      </template>
    </BaseDialog>

    <ConfirmDialog
      :show="showSubmitDialogFlag"
      title="确认提交"
      message="确认提交该发票？"
      confirm-text="确认"
      cancel-text="取消"
      :loading="submittingInvoice"
      loading-text="提交中..."
      @confirm="handleSubmit"
      @cancel="showSubmitDialogFlag = false"
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
import { invoiceAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useCrudList, useCrudPermission } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { StatusTag, Select, SearchInput, Icon, Input, TextArea, InputNumber, TablePageLayout, DataTable, EmptyState, Pagination, BaseDialog, ConfirmDialog, DescriptionGrid, DescriptionItem, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import InvoiceStats from './components/InvoiceStats.vue'
import CustomerSelector from '@/views/customer/components/CustomerSelector.vue'
import QuickCustomerCreateDialog from '@/views/customer/components/QuickCustomerCreateDialog.vue'

const statsLoading = ref(false)
const submitting = ref(false)
const customerList = ref<any[]>([])
const currentInvoice = ref(null)
const stats = ref({})
const detailDialogVisible = ref(false)
const formDialogVisible = ref(false)
const isEdit = ref(false)
const showQuickCustomerCreate = ref(false)

const submittingInvoice = ref(false)
const showSubmitDialogFlag = ref(false)
const targetInvoiceForSubmit = ref<any>(null)

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
    const payload = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || response || {})
    const summary = payload?.summary || {}
    const byStatus = payload?.by_status || []

    let pendingAmount = 0
    let receivedAmount = 0
    try {
      const listResponse: any = await invoiceAPI.getList({ page_size: 1000 })
      const list = Array.isArray(listResponse) ? listResponse : (listResponse?.results || listResponse?.data || listResponse || [])
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
    const response: any = await customerAPI.getList({ page_size: 50 })
    customerList.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || [])
  } catch (error: any) {}
}

const handleCustomerCreated = (customer: any) => {
  customerList.value.push(customer)
  form.customer = customer.id
}

const handleView = async (row: any) => {
  try {
    const response: any = await invoiceAPI.getDetail(row.id)
    currentInvoice.value = Array.isArray(response) ? response : ((response as any)?.results || (response as any)?.data || response || {})
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

const openSubmitDialog = (row: any) => {
  targetInvoiceForSubmit.value = row
  showSubmitDialogFlag.value = true
}

const handleSubmit = async () => {
  const row = targetInvoiceForSubmit.value
  showSubmitDialogFlag.value = false
  if (!row) return
  try {
    submittingInvoice.value = true
    await invoiceAPI.submit(row.id)
    useUIStore().showSuccess('提交成功')
    loadData()
    fetchStats()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '提交失败')
  } finally {
    submittingInvoice.value = false
  }
}

const handleSave = async () => {
  if (!form.customer) { useUIStore().showWarning('请选择客户'); return }
  if (!form.invoice_type) { useUIStore().showWarning('请选择发票类型'); return }
  if (!form.issue_date) { useUIStore().showWarning('请选择开票日期'); return }
  if (!form.amount) { useUIStore().showWarning('请输入金额'); return }

  submitting.value = true
  try {
    const data = { ...form }
    if (data.id) {
      delete (data as any).id
      await invoiceAPI.update(form.id!, data)
      useUIStore().showSuccess('发票更新成功')
    } else {
      await invoiceAPI.create(data)
      useUIStore().showSuccess('发票创建成功')
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

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value && row.status === 'draft' },
  { key: 'submit', label: '提交', icon: 'upload', tone: 'warning', visible: canEdit.value && row.status === 'draft' }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'edit': handleEdit(row); break
    case 'submit': openSubmitDialog(row); break
  }
}

onMounted(() => {
  loadData()
  fetchStats()
  fetchCustomers()
})
</script>
