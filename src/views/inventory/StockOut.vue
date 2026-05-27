<template>
  <TablePageLayout
    title="出库单"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索出库单号、客户、发货单"
          @search="searchAndRefreshSummary"
          @clear="searchAndRefreshSummary"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          class="w-full sm:w-36"
          placeholder="状态"
          clearable
          @change="searchAndRefreshSummary"
        />
        <Select
          v-model="filters.out_type"
          :options="outTypeOptions"
          class="w-full sm:w-36"
          placeholder="出库类型"
          clearable
          @change="searchAndRefreshSummary"
        />
        <input
          v-model="filters.start_date"
          type="date"
          class="input w-full sm:w-40"
          @change="searchAndRefreshSummary"
        >
        <input
          v-model="filters.end_date"
          type="date"
          class="input w-full sm:w-40"
          @change="searchAndRefreshSummary"
        >
      </FilterRow>
    </template>

    <template #actions>
      <div class="flex justify-end gap-3">
        <button
          v-if="hasFilters"
          class="btn btn-secondary"
          @click="handleReset"
        >
          重置筛选
        </button>
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
        <button
          v-if="canCreate"
          class="btn btn-primary"
          @click="showCreateDialog"
        >
          <Icon
            name="plus"
            size="md"
            class="mr-2"
          />
          新建出库单
        </button>
      </div>
    </template>

    <template #table>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
            <div class="text-2xl font-semibold">{{ summary.total_count || 0 }}</div>
            <div class="text-xs text-gray-500">出库单总数</div>
          </div>
          <div class="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <div class="text-2xl font-semibold">{{ summary.draft_count || 0 }}</div>
            <div class="text-xs text-gray-500">待提交</div>
          </div>
          <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div class="text-2xl font-semibold">{{ summary.submitted_count || 0 }}</div>
            <div class="text-xs text-gray-500">待审核</div>
          </div>
          <div class="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div class="text-2xl font-semibold">{{ summary.completed_count || 0 }}</div>
            <div class="text-xs text-gray-500">已完成</div>
          </div>
        </div>

        <DataTable
          :columns="columns"
          :data="tableData"
          :loading="loading"
          :row-key="(row: any) => row.id"
          :server-side-sort="true"
          default-sort-key="created_at"
          default-sort-order="desc"
          @sort="handleSort"
        >
          <template #cell-out_type="{ row }">
            {{ row.out_type_display || outTypeLabel(row.out_type) }}
          </template>
          <template #cell-related_order="{ row }">
            {{ row.delivery_order_number || '-' }}
          </template>
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="stock"
              :label="row.status_display"
            />
          </template>
          <template #cell-stock_out_date="{ row }">
            {{ formatDate(row.stock_out_date) }}
          </template>
          <template #cell-created_at="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
          <template #cell-actions="{ row }">
            <RowActions
              :actions="getRowActions(row)"
              @action="action => handleRowAction(action.key, row)"
            />
          </template>
          <template #empty>
            <EmptyState
              :description="hasFilters ? '未找到匹配的出库单' : '暂无出库单数据'"
              :action-text="canCreate && !hasFilters ? '创建第一个出库单' : undefined"
              @action="showCreateDialog"
            />
          </template>
        </DataTable>
      </div>
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

  <BaseDialog
    :show="formDialogVisible"
    :title="form.id ? '编辑出库单' : '新建出库单'"
    width="normal"
    @close="formDialogVisible = false"
  >
    <div class="space-y-4">
      <Select
        v-model="form.out_type"
        :options="outTypeOptions"
        label="出库类型"
        :disabled="submitting"
      />
      <Select
        v-model="form.delivery_order"
        :options="deliveryOrderOptions"
        label="发货单"
        placeholder="选择待发货发货单"
        searchable
        clearable
        :disabled="submitting || form.out_type !== 'delivery'"
      />
      <Input
        v-model="form.stock_out_date"
        type="date"
        label="出库日期"
      />
      <TextArea
        v-model="form.notes"
        label="备注"
        :rows="3"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        :disabled="submitting"
        @click="formDialogVisible = false"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting"
        @click="handleFormSubmit"
      >
        {{ submitting ? '保存中...' : '保存' }}
      </button>
    </template>
  </BaseDialog>

  <BaseDialog
    :show="detailDialogVisible"
    title="出库单详情"
    width="wide"
    @close="detailDialogVisible = false"
  >
    <DescriptionGrid
      v-if="currentStockOut"
      :columns="2"
    >
      <DescriptionItem label="出库单号">{{ currentStockOut.order_number || '-' }}</DescriptionItem>
      <DescriptionItem label="状态">{{ currentStockOut.status_display || currentStockOut.status || '-' }}</DescriptionItem>
      <DescriptionItem label="出库类型">{{ currentStockOut.out_type_display || outTypeLabel(currentStockOut.out_type) }}</DescriptionItem>
      <DescriptionItem label="发货单">{{ currentStockOut.delivery_order_number || '-' }}</DescriptionItem>
      <DescriptionItem label="客户">{{ currentStockOut.customer_name || '-' }}</DescriptionItem>
      <DescriptionItem label="出库日期">{{ formatDate(currentStockOut.stock_out_date) }}</DescriptionItem>
      <DescriptionItem label="操作员">{{ currentStockOut.operator_name || '-' }}</DescriptionItem>
      <DescriptionItem label="提交人">{{ currentStockOut.submitted_by_name || '-' }}</DescriptionItem>
      <DescriptionItem label="提交时间">{{ formatDateTime(currentStockOut.submitted_at) }}</DescriptionItem>
      <DescriptionItem label="审核人">{{ currentStockOut.approved_by_name || '-' }}</DescriptionItem>
      <DescriptionItem label="审核时间">{{ formatDateTime(currentStockOut.approved_at) }}</DescriptionItem>
      <DescriptionItem label="备注" :span="2">{{ currentStockOut.notes || '-' }}</DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <button
        class="btn"
        @click="detailDialogVisible = false"
      >
        关闭
      </button>
    </template>
  </BaseDialog>

  <ConfirmDialog
    :show="showSubmitDialog"
    title="提交出库单"
    :message="`确定要提交出库单「${currentStockOut?.order_number}」吗？提交后将进入审核流程。`"
    confirm-text="提交"
    cancel-text="取消"
    :loading="submittingAction"
    @confirm="handleSubmit"
    @cancel="showSubmitDialog = false"
  />

  <ConfirmDialog
    :show="showApproveDialog"
    title="审核出库单"
    :message="`确定要审核通过出库单「${currentStockOut?.order_number}」吗？审核后库存将被相应扣减。`"
    confirm-text="审核通过"
    cancel-text="取消"
    :loading="submittingAction"
    @confirm="handleApprove"
    @cancel="showApproveDialog = false"
  />

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除出库单"
    :message="`确定要删除出库单「${currentStockOut?.order_number}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    :loading="deleting"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { deliveryOrderAPI, stockOutAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import {
  BaseDialog,
  ConfirmDialog,
  DataTable,
  DescriptionGrid,
  DescriptionItem,
  EmptyState,
  FilterRow,
  Icon,
  Input,
  Pagination,
  RowActions,
  SearchInput,
  Select,
  StatusTag,
  TablePageLayout,
  TextArea
} from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const statusOptions = [
  { label: '待提交', value: 'draft' },
  { label: '待审核', value: 'submitted' },
  { label: '已完成', value: 'completed' }
]
const outTypeOptions = [
  { label: '发货出库', value: 'delivery' },
  { label: '退货出库', value: 'return' },
  { label: '调拨出库', value: 'transfer' },
  { label: '次品出库', value: 'defective' }
]

const columns: Column[] = [
  { key: 'order_number', label: '出库单号', sortable: true, class: 'w-32' },
  { key: 'customer_name', label: '客户', sortable: true, class: 'w-40' },
  { key: 'out_type', label: '出库类型', sortable: true, class: 'w-28' },
  { key: 'related_order', label: '发货单号', sortable: true, class: 'w-32' },
  { key: 'stock_out_date', label: '出库日期', sortable: true, class: 'w-32' },
  { key: 'status', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'operator_name', label: '操作员', sortable: true, class: 'w-24' },
  { key: 'created_at', label: '创建时间', sortable: true, class: 'w-40' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-56' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortFieldMap: Record<string, string> = {
  customer_name: 'delivery_order__customer__name',
  related_order: 'delivery_order__order_number',
  operator_name: 'operator__username'
}

const buildParams = (params: Record<string, unknown>) => {
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
} = useCrudList(stockOutAPI, 'getList', {
  initialFilters: { status: '', out_type: '', start_date: '', end_date: '' },
  buildParams,
  errorContext: '加载出库单数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('stockout')
const summaryStats = ref<any>({})
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const showSubmitDialog = ref(false)
const showApproveDialog = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const submittingAction = ref(false)
const deleting = ref(false)
const currentStockOut = ref<any>(null)
const deliveryOrderOptions = ref<Array<{ value: number, label: string }>>([])
const form = reactive({
  id: null as number | null,
  out_type: 'delivery',
  delivery_order: null as number | null,
  stock_out_date: '',
  notes: ''
})

const summary = computed(() => summaryStats.value?.summary || {})
const todayText = () => new Date().toISOString().slice(0, 10)
const formatDate = (value: string | null | undefined) => value ? String(value).slice(0, 10) : '-'
const formatDateTime = (value: string | null | undefined) => value ? String(value).replace('T', ' ').slice(0, 19) : '-'
const outTypeLabel = (value: string) => outTypeOptions.find(option => option.value === value)?.label || value || '-'

watch(() => form.out_type, (value) => {
  if (value !== 'delivery') form.delivery_order = null
})

const fetchSummary = async () => {
  try {
    summaryStats.value = await stockOutAPI.getSummary(buildParams({
      search: searchText.value,
      status: filters.value.status,
      out_type: filters.value.out_type,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    }))
  } catch {
    summaryStats.value = {}
  }
}

const reloadData = async () => {
  await loadData()
  fetchSummary()
}

const searchAndRefreshSummary = async () => {
  await handleSearch()
  fetchSummary()
}

const handleReset = async () => {
  await resetFilters()
  fetchSummary()
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  reloadData()
}

const loadDeliveryOrders = async () => {
  try {
    const response: any = await deliveryOrderAPI.getList({
      page_size: 100,
      ordering: '-created_at',
      status: 'pending'
    })
    deliveryOrderOptions.value = ((response?.results || []) as any[]).map((order: any) => ({
      value: order.id,
      label: `${order.order_number}${order.customer_name ? ` · ${order.customer_name}` : ''}`
    }))
  } catch {
    deliveryOrderOptions.value = []
  }
}

const showCreateDialog = async () => {
  if (!canCreate.value) return
  Object.assign(form, {
    id: null,
    out_type: 'delivery',
    delivery_order: null,
    stock_out_date: todayText(),
    notes: ''
  })
  await loadDeliveryOrders()
  formDialogVisible.value = true
}

const showEditDialog = async (row: any) => {
  if (!canEdit.value || row.status !== 'draft') return
  Object.assign(form, {
    id: row.id,
    out_type: row.out_type || 'delivery',
    delivery_order: row.delivery_order || null,
    stock_out_date: formatDate(row.stock_out_date),
    notes: row.notes || ''
  })
  await loadDeliveryOrders()
  if (row.delivery_order && !deliveryOrderOptions.value.some(option => option.value === row.delivery_order)) {
    deliveryOrderOptions.value.unshift({
      value: row.delivery_order,
      label: row.delivery_order_number || `发货单 #${row.delivery_order}`
    })
  }
  formDialogVisible.value = true
}

const handleFormSubmit = async () => {
  if (form.out_type === 'delivery' && !form.delivery_order) {
    useUIStore().showWarning('发货出库必须选择发货单')
    return
  }
  if (!form.stock_out_date) {
    useUIStore().showWarning('请选择出库日期')
    return
  }
  submitting.value = true
  try {
    const payload = {
      out_type: form.out_type,
      delivery_order: form.out_type === 'delivery' ? form.delivery_order : null,
      stock_out_date: form.stock_out_date,
      notes: form.notes.trim()
    }
    if (form.id) {
      await stockOutAPI.update(form.id, payload)
      useUIStore().showSuccess('更新成功')
    } else {
      await stockOutAPI.create(payload)
      useUIStore().showSuccess('创建成功')
    }
    formDialogVisible.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '保存出库单')
  } finally {
    submitting.value = false
  }
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value && row.status === 'draft' },
  { key: 'submit', label: '提交', icon: 'send', tone: 'warning', visible: canEdit.value && row.status === 'draft' },
  { key: 'approve', label: '审核', icon: 'checkCircle', tone: 'success', visible: canEdit.value && row.status === 'submitted' },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value && row.status === 'draft' }
]

const handleRowAction = (action: string, row: any) => {
  currentStockOut.value = row
  switch (action) {
    case 'view':
      detailDialogVisible.value = true
      break
    case 'edit':
      showEditDialog(row)
      break
    case 'delete':
      showDeleteDialog.value = true
      break
    case 'submit':
      showSubmitDialog.value = true
      break
    case 'approve':
      showApproveDialog.value = true
      break
  }
}

const handleSubmit = async () => {
  if (!currentStockOut.value) return
  submittingAction.value = true
  try {
    await stockOutAPI.submit(currentStockOut.value.id)
    useUIStore().showSuccess('提交成功')
    showSubmitDialog.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '提交出库单')
  } finally {
    submittingAction.value = false
  }
}

const handleApprove = async () => {
  if (!currentStockOut.value) return
  submittingAction.value = true
  try {
    await stockOutAPI.approve(currentStockOut.value.id)
    useUIStore().showSuccess('审核成功')
    showApproveDialog.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '审核出库单')
  } finally {
    submittingAction.value = false
  }
}

const handleDelete = async () => {
  if (!currentStockOut.value) return
  deleting.value = true
  try {
    await stockOutAPI.delete(currentStockOut.value.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除出库单')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  reloadData()
})
</script>
