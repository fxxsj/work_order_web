<template>
  <div class="space-y-6">
    <TablePageLayout>
      <template #actions>
        <div class="space-y-4">
          <div class="flex justify-end gap-3">
            <BaseButton
              variant="secondary"
              icon="refresh"
              title="刷新"
              :loading="loading"
              @click="reloadData"
            />
            <BaseButton
              variant="secondary"
              @click="handlePrint"
            >
              打印
            </BaseButton>
            <BaseButton
              variant="primary"
              icon="plus"
              @click="handleCreate"
            >
              生成
            </BaseButton>
          </div>

          <FilterRow>
            <SearchInput
              v-model="searchText"
              class="w-full sm:w-56"
              placeholder="搜索对账单号/周期/对方单位"
              @search="searchAndRefreshStats"
              @clear="searchAndRefreshStats"
            />
            <Select
              v-model="filters.type"
              :options="statementTypeOptions"
              class="w-full sm:w-36"
              placeholder="对账类型"
              clearable
              @change="searchAndRefreshStats"
            />
            <Select
              v-model="filters.status"
              :options="statementStatusOptions"
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
            <DateRangePicker
              v-model="statementDateRange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="searchAndRefreshStats"
            />
            <BaseButton
              variant="secondary"
              icon="rotateCcw"
              @click="handleReset"
            >
              重置
            </BaseButton>
          </FilterRow>

          <StatementStats
            :stats="stats"
            :loading="statsLoading"
          />
        </div>
      </template>

      <template #table>
        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :row-key="(row: any) => row.id"
          :server-side-sort="true"
          default-sort-key="period"
          default-sort-order="desc"
          @sort="handleSort"
        >
          <template #cell-partner_name="{ row }">
            <span>{{ row.partner_name || row.customer_name || row.supplier_name || '-' }}</span>
          </template>
          <template #cell-period="{ row }">
            <span>{{ row.period || '-' }}</span>
          </template>
          <template #cell-start_date="{ row }">
            <span>{{ row.start_date || '-' }}</span>
          </template>
          <template #cell-end_date="{ row }">
            <span>{{ row.end_date || '-' }}</span>
          </template>
          <template #cell-opening_balance="{ row }">
            <span>¥{{ formatAmount(row.opening_balance) }}</span>
          </template>
          <template #cell-total_debit="{ row }">
            <span>¥{{ formatAmount(row.total_debit) }}</span>
          </template>
          <template #cell-total_credit="{ row }">
            <span>¥{{ formatAmount(row.total_credit) }}</span>
          </template>
          <template #cell-closing_balance="{ row }">
            <span class="text-strong">¥{{ formatAmount(row.closing_balance) }}</span>
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="statement"
              :label="row.status_display"
            />
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
            <EmptyState
              :description="hasFilters ? '未找到匹配的对账单' : '暂无对账单数据'"
              :action-text="hasFilters ? '重置筛选' : undefined"
              @action="handleReset"
            />
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
      title="对账单详情"
      width="wide"
      @close="detailDialogVisible = false"
    >
      <DescriptionGrid
        v-if="currentStatement"
        :columns="2"
      >
        <DescriptionItem label="对账单号">
          {{ (currentStatement as any).statement_number }}
        </DescriptionItem>
        <DescriptionItem label="对账类型">
          {{ (currentStatement as any).statement_type_display || getStatementTypeText((currentStatement as any).statement_type) }}
        </DescriptionItem>
        <DescriptionItem label="对方单位">
          {{ (currentStatement as any).partner_name || (currentStatement as any).customer_name || (currentStatement as any).supplier_name || '-' }}
        </DescriptionItem>
        <DescriptionItem label="对账周期">
          {{ (currentStatement as any).period || '-' }}
        </DescriptionItem>
        <DescriptionItem label="期间开始">
          {{ (currentStatement as any).start_date || '-' }}
        </DescriptionItem>
        <DescriptionItem label="期间结束">
          {{ (currentStatement as any).end_date || '-' }}
        </DescriptionItem>
        <DescriptionItem label="期初余额">
          ¥{{ formatAmount((currentStatement as any).opening_balance) }}
        </DescriptionItem>
        <DescriptionItem label="本期借方">
          ¥{{ formatAmount((currentStatement as any).total_debit) }}
        </DescriptionItem>
        <DescriptionItem label="本期贷方">
          ¥{{ formatAmount((currentStatement as any).total_credit) }}
        </DescriptionItem>
        <DescriptionItem label="期末余额">
          ¥{{ formatAmount((currentStatement as any).closing_balance) }}
        </DescriptionItem>
        <DescriptionItem label="状态">
          <StatusTag
            :status="(currentStatement as any).status"
            category="statement"
            :label="(currentStatement as any).status_display"
          />
        </DescriptionItem>
        <DescriptionItem label="下一步">
          {{ (currentStatement as any).follow_up_text || '-' }}
        </DescriptionItem>
        <DescriptionItem label="确认人">
          {{ (currentStatement as any).confirmed_by_name || '-' }}
        </DescriptionItem>
        <DescriptionItem label="确认时间">
          {{ (currentStatement as any).confirmed_at || '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="确认备注"
          :span="2"
        >
          {{ (currentStatement as any).confirmation_notes || '-' }}
        </DescriptionItem>
        <DescriptionItem
          label="备注"
          :span="2"
        >
          {{ (currentStatement as any).notes || '-' }}
        </DescriptionItem>
      </DescriptionGrid>
      <template #footer>
        <BaseButton
          variant="secondary"
          @click="detailDialogVisible = false"
        >
          关闭
        </BaseButton>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="showCreateModal"
      title="生成对账单"
      width="normal"
      @close="showCreateModal = false"
    >
      <form
        id="statement-form"
        class="space-y-5"
        @submit.prevent="handleGenerate"
      >
        <div>
          <label class="input-label mb-1.5 block">对账类型</label>
          <Select
            v-model="form.statement_type"
            :options="statementTypeOptions"
            class="w-full"
          />
        </div>
        <div v-if="form.statement_type === 'customer'">
          <label class="input-label mb-1.5 block">客户</label>
          <Select
            v-model="form.customer"
            :options="customerOptions"
            class="w-full"
            placeholder="请选择客户"
            filterable
          />
        </div>
        <div v-else>
          <label class="input-label mb-1.5 block">供应商</label>
          <Select
            v-model="form.supplier"
            :options="supplierOptions"
            class="w-full"
            placeholder="请选择供应商"
            filterable
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">对账周期</label>
          <input
            v-model="form.period"
            type="month"
            class="input w-full"
            required
          >
        </div>
        <div
          v-if="previewData"
          class="rounded-lg border border-gray-200 p-4 text-sm dark:border-dark-700"
        >
          <div class="mb-2 font-medium text-gray-900 dark:text-gray-100">
            生成预览
          </div>
          <div class="grid grid-cols-2 gap-3">
            <span>期初余额: ¥{{ formatAmount((previewData as any).opening_balance) }}</span>
            <span>本期借方: ¥{{ formatAmount((previewData as any).total_debit) }}</span>
            <span>本期贷方: ¥{{ formatAmount((previewData as any).total_credit) }}</span>
            <span>期末余额: ¥{{ formatAmount((previewData as any).closing_balance) }}</span>
          </div>
        </div>
      </form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton
            type="button"
            variant="secondary"
            @click="showCreateModal = false"
          >
            取消
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            :loading="submitting"
            @click="handlePreview"
          >
            预览
          </BaseButton>
          <BaseButton
            form="statement-form"
            type="submit"
            variant="primary"
            :loading="submitting"
          >
            生成
          </BaseButton>
        </div>
      </template>
    </BaseDialog>

    <BaseDialog
      :show="confirmDialogVisible"
      :title="confirmAction === 'confirm' ? '确认对账单' : '标记为有异议'"
      width="narrow"
      @close="confirmDialogVisible = false"
    >
      <TextArea
        v-model="confirmNotes"
        label="处理说明"
        :rows="4"
        class="w-full"
      />
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton
            variant="secondary"
            @click="confirmDialogVisible = false"
          >
            取消
          </BaseButton>
          <BaseButton
            variant="primary"
            :loading="confirmSubmitting"
            @click="submitConfirm"
          >
            确认
          </BaseButton>
        </div>
      </template>
    </BaseDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { statementAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { supplierAPI } from '@/api/modules/supplier'
import { useCrudList } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'
import { StatusTag, Select, TextArea, TablePageLayout, DataTable, EmptyState, Pagination, BaseButton, BaseDialog, RowActions, SearchInput, DescriptionGrid, DescriptionItem, FilterRow, DateRangePicker } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import StatementStats from './components/StatementStats.vue'

const statsLoading = ref(false)
const submitting = ref(false)
const confirmSubmitting = ref(false)
const stats = ref({})
const showCreateModal = ref(false)
const detailDialogVisible = ref(false)
const confirmDialogVisible = ref(false)
const confirmAction = ref<'confirm' | 'dispute'>('confirm')
const confirmNotes = ref('')
const targetStatement = ref<any>(null)
const currentStatement = ref<any>(null)
const previewData = ref<any>(null)
const customers = ref<any[]>([])
const suppliers = ref<any[]>([])
const sortKey = ref('period')
const sortOrder = ref<'asc' | 'desc'>('desc')

const form = reactive({
  statement_type: 'customer',
  customer: undefined as number | undefined,
  supplier: undefined as number | undefined,
  period: ''
})

const sortFieldMap: Record<string, string> = {
  partner_name: 'customer__name',
  statement_type_display: 'statement_type'
}

const columns: Column[] = [
  { key: 'statement_number', label: '对账单号', width: 144, sortable: true },
  { key: 'statement_type_display', label: '类型', width: 112, sortable: true },
  { key: 'partner_name', label: '对方单位', width: 160, sortable: true },
  { key: 'period', label: '周期', width: 96, sortable: true },
  { key: 'start_date', label: '期间开始', width: 112, sortable: true },
  { key: 'end_date', label: '期间结束', width: 112, sortable: true },
  { key: 'total_debit', label: '本期借方', width: 112, align: 'right', sortable: true },
  { key: 'total_credit', label: '本期贷方', width: 112, align: 'right', sortable: true },
  { key: 'closing_balance', label: '期末余额', width: 112, align: 'right', sortable: true },
  { key: 'status', label: '状态', width: 96, sortable: true },
  { key: 'follow_up_text', label: '下一步', width: 144 },
  { key: 'actions', label: '操作', width: 160, fixed: 'right' }
]

const statementTypeOptions = [
  { value: 'customer', label: '客户对账' },
  { value: 'supplier', label: '供应商对账' }
]
const statementStatusOptions = [
  { value: 'draft', label: '草稿' },
  { value: 'sent', label: '已发送' },
  { value: 'confirmed', label: '已确认' },
  { value: 'disputed', label: '有异议' }
]
const todoOptions = [
  { value: 'pending_confirm', label: '待确认' },
  { value: 'disputed', label: '异议待处理' }
]

const customerOptions = computed(() => customers.value.map((row: any) => ({ value: row.id, label: row.name })))
const supplierOptions = computed(() => suppliers.value.map((row: any) => ({ value: row.id, label: row.name })))

const buildStatementParams = (params: Record<string, unknown>) => {
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
} = useCrudList(statementAPI, 'getList', {
  initialFilters: { type: '', status: '', todo: '', period_start: '', period_end: '' },
  buildParams: buildStatementParams,
  errorContext: '加载对账单失败'
})

const statementDateRange = computed<[string, string]>({
  get: (): [string, string] => [String(filters.value.period_start || ''), String(filters.value.period_end || '')],
  set: ([start, end]: [string, string]) => {
    filters.value.period_start = start
    filters.value.period_end = end
  }
})

const fetchStats = async () => {
  statsLoading.value = true
  try {
    const response: any = await statementAPI.getSummary(buildStatementParams({
      search: searchText.value,
      type: filters.value.type,
      status: filters.value.status,
      todo: filters.value.todo,
      period_start: filters.value.period_start,
      period_end: filters.value.period_end
    }))
    const payload = response?.data || response
    const summary = payload?.summary || {}
    stats.value = {
      total_count: summary.total_count || 0,
      total_debit: summary.total_debit || 0,
      total_credit: summary.total_credit || 0,
      closing_balance: summary.closing_balance || 0
    }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error: any) {
    stats.value = {}
  } finally {
    statsLoading.value = false
  }
}

const fetchPartners = async () => {
  try {
    const [customerResponse, supplierResponse]: any[] = await Promise.all([
      customerAPI.getList({ page_size: 100 }),
      supplierAPI.getList({ page_size: 100 })
    ])
    customers.value = Array.isArray(customerResponse) ? customerResponse : (customerResponse?.results || customerResponse?.data || [])
    suppliers.value = Array.isArray(supplierResponse) ? supplierResponse : (supplierResponse?.results || supplierResponse?.data || [])
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载客户/供应商失败')
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

const handleView = async (row: any) => {
  try {
    currentStatement.value = await statementAPI.getDetail(row.id)
    detailDialogVisible.value = true
  } catch (error: any) {
    ErrorHandler.showMessage(error, '获取对账单详情失败')
  }
}

const openConfirmDialog = (row: any, action: 'confirm' | 'dispute') => {
  targetStatement.value = row
  confirmAction.value = action
  confirmNotes.value = ''
  confirmDialogVisible.value = true
}

const submitConfirm = async () => {
  const row = targetStatement.value
  if (!row) return
  confirmSubmitting.value = true
  try {
    await statementAPI.confirm(row.id, {
      confirmed: confirmAction.value === 'confirm',
      confirmation_notes: confirmNotes.value.trim()
    })
    useUIStore().showSuccess(confirmAction.value === 'confirm' ? '对账单已确认' : '已标记为有异议')
    confirmDialogVisible.value = false
    reloadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '处理对账单失败')
  } finally {
    confirmSubmitting.value = false
  }
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'confirm', label: '确认', icon: 'check', tone: 'primary', visible: row.status === 'draft' || row.status === 'sent' },
  { key: 'dispute', label: '异议', icon: 'warning', tone: 'warning', visible: row.status === 'draft' || row.status === 'sent' }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'confirm': openConfirmDialog(row, 'confirm'); break
    case 'dispute': openConfirmDialog(row, 'dispute'); break
  }
}

const handleCreate = async () => {
  if (!customers.value.length && !suppliers.value.length) await fetchPartners()
  const now = new Date()
  form.period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  form.statement_type = 'customer'
  form.customer = undefined
  form.supplier = undefined
  previewData.value = null
  showCreateModal.value = true
}

const buildGenerateParams = () => {
  if (!form.period) {
    useUIStore().showWarning('请选择对账周期')
    return null
  }
  const params: Record<string, unknown> = { period: form.period }
  if (form.statement_type === 'customer') {
    if (!form.customer) {
      useUIStore().showWarning('请选择客户')
      return null
    }
    params.customer = form.customer
  } else {
    if (!form.supplier) {
      useUIStore().showWarning('请选择供应商')
      return null
    }
    params.supplier = form.supplier
  }
  return params
}

const handlePreview = async () => {
  const params = buildGenerateParams()
  if (!params) return
  submitting.value = true
  try {
    const response: any = await statementAPI.generate(params)
    previewData.value = response?.data || response
  } catch (error: any) {
    ErrorHandler.showMessage(error, '生成预览失败')
  } finally {
    submitting.value = false
  }
}

const handleGenerate = async () => {
  const params = buildGenerateParams()
  if (!params) return
  submitting.value = true
  try {
    const response: any = await statementAPI.generate(params)
    const payload = response?.data || response
    await statementAPI.create({
      statement_type: payload.statement_type,
      customer: (params as any).customer,
      supplier: (params as any).supplier,
      period: payload.period,
      start_date: payload.start_date,
      end_date: payload.end_date,
      opening_balance: payload.opening_balance,
      total_debit: payload.total_debit,
      total_credit: payload.total_credit
    })
    useUIStore().showSuccess('对账单已生成')
    showCreateModal.value = false
    reloadData()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '生成对账单失败')
  } finally {
    submitting.value = false
  }
}

const formatAmount = (value: unknown) => Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

const getStatementTypeText = (value: string) => statementTypeOptions.find(option => option.value === value)?.label || value || '-'
const handlePrint = () => window.print()

onMounted(() => { reloadData(); fetchPartners() })
</script>
