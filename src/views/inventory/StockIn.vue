<template>
  <TablePageLayout
    title="入库单"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索入库单号、客户、施工单"
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
          新建入库单
        </button>
      </div>
    </template>

    <template #table>
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800">
            <div class="text-2xl font-semibold">{{ summary.total_count || 0 }}</div>
            <div class="text-xs text-gray-500">入库单总数</div>
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
          <template #cell-status="{ row }">
            <StatusTag
              :status="row.status"
              category="stock"
              :label="row.status_display"
            />
          </template>
          <template #cell-stock_in_date="{ row }">
            {{ formatDate(row.stock_in_date) }}
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
              :description="hasFilters ? '未找到匹配的入库单' : '暂无入库单数据'"
              :action-text="canCreate && !hasFilters ? '创建第一个入库单' : undefined"
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
    :title="form.id ? '编辑入库单' : '新建入库单'"
    width="normal"
    @close="formDialogVisible = false"
  >
    <div class="space-y-4">
      <Select
        v-model="form.work_order"
        :options="workOrderOptions"
        label="施工单"
        placeholder="选择施工单"
        searchable
        :disabled="submitting || Boolean(form.id)"
      />
      <Input
        v-model="form.stock_in_date"
        type="date"
        label="入库日期"
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
    title="入库单详情"
    width="wide"
    @close="detailDialogVisible = false"
  >
    <DescriptionGrid
      v-if="currentStockIn"
      :columns="2"
    >
      <DescriptionItem label="入库单号">{{ currentStockIn.order_number || '-' }}</DescriptionItem>
      <DescriptionItem label="状态">{{ currentStockIn.status_display || currentStockIn.status || '-' }}</DescriptionItem>
      <DescriptionItem label="客户">{{ currentStockIn.customer_name || '-' }}</DescriptionItem>
      <DescriptionItem label="施工单">{{ currentStockIn.work_order_number || '-' }}</DescriptionItem>
      <DescriptionItem label="入库日期">{{ formatDate(currentStockIn.stock_in_date) }}</DescriptionItem>
      <DescriptionItem label="操作员">{{ currentStockIn.operator_name || '-' }}</DescriptionItem>
      <DescriptionItem label="提交人">{{ currentStockIn.submitted_by_name || '-' }}</DescriptionItem>
      <DescriptionItem label="提交时间">{{ formatDateTime(currentStockIn.submitted_at) }}</DescriptionItem>
      <DescriptionItem label="审核人">{{ currentStockIn.approved_by_name || '-' }}</DescriptionItem>
      <DescriptionItem label="审核时间">{{ formatDateTime(currentStockIn.approved_at) }}</DescriptionItem>
      <DescriptionItem label="备注" :span="2">{{ currentStockIn.notes || '-' }}</DescriptionItem>
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
    title="提交入库单"
    :message="`确定要提交入库单「${currentStockIn?.order_number}」吗？提交后将进入审核流程。`"
    confirm-text="提交"
    cancel-text="取消"
    :loading="submittingAction"
    @confirm="handleSubmit"
    @cancel="showSubmitDialog = false"
  />

  <ConfirmDialog
    :show="showApproveDialog"
    title="审核入库单"
    :message="`确定要审核通过入库单「${currentStockIn?.order_number}」吗？审核后库存将被相应增加。`"
    confirm-text="审核通过"
    cancel-text="取消"
    :loading="submittingAction"
    @confirm="handleApprove"
    @cancel="showApproveDialog = false"
  />

  <ConfirmDialog
    :show="showDeleteDialog"
    title="删除入库单"
    :message="`确定要删除入库单「${currentStockIn?.order_number}」吗？此操作不可撤销。`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    :loading="deleting"
    @confirm="handleDelete"
    @cancel="showDeleteDialog = false"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { stockInAPI, workOrderAPI } from '@/api/modules'
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

const columns: Column[] = [
  { key: 'order_number', label: '入库单号', sortable: true, class: 'w-32' },
  { key: 'customer_name', label: '客户', sortable: true, class: 'w-40' },
  { key: 'work_order_number', label: '施工单号', sortable: true, class: 'w-32' },
  { key: 'stock_in_date', label: '入库日期', sortable: true, class: 'w-32' },
  { key: 'status', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'operator_name', label: '操作员', sortable: true, class: 'w-24' },
  { key: 'created_at', label: '创建时间', sortable: true, class: 'w-40' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-56' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const sortFieldMap: Record<string, string> = {
  customer_name: 'work_order__customer__name',
  work_order_number: 'work_order__order_number',
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
} = useCrudList(stockInAPI, 'getList', {
  initialFilters: { status: '', start_date: '', end_date: '' },
  buildParams,
  errorContext: '加载入库单数据失败'
})

const { canCreate, canEdit, canDelete } = useCrudPermission('stockin')
const summaryStats = ref<any>({})
const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const showSubmitDialog = ref(false)
const showApproveDialog = ref(false)
const showDeleteDialog = ref(false)
const submitting = ref(false)
const submittingAction = ref(false)
const deleting = ref(false)
const currentStockIn = ref<any>(null)
const workOrderOptions = ref<Array<{ value: number, label: string }>>([])
const form = reactive({
  id: null as number | null,
  work_order: null as number | null,
  stock_in_date: '',
  notes: ''
})

const summary = computed(() => summaryStats.value?.summary || {})
const todayText = () => new Date().toISOString().slice(0, 10)
const formatDate = (value: string | null | undefined) => value ? String(value).slice(0, 10) : '-'
const formatDateTime = (value: string | null | undefined) => value ? String(value).replace('T', ' ').slice(0, 19) : '-'

const fetchSummary = async () => {
  try {
    summaryStats.value = await stockInAPI.getSummary(buildParams({
      search: searchText.value,
      status: filters.value.status,
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

const loadWorkOrders = async () => {
  try {
    const response: any = await workOrderAPI.getList({
      page_size: 100,
      ordering: '-created_at',
      approval_status: 'approved'
    })
    workOrderOptions.value = ((response?.results || []) as any[])
      .filter((order: any) => !['completed', 'cancelled'].includes(order.status))
      .map((order: any) => ({
        value: order.id,
        label: `${order.order_number}${order.customer_name ? ` · ${order.customer_name}` : ''}`
      }))
  } catch {
    workOrderOptions.value = []
  }
}

const showCreateDialog = async () => {
  if (!canCreate.value) return
  Object.assign(form, {
    id: null,
    work_order: null,
    stock_in_date: todayText(),
    notes: ''
  })
  await loadWorkOrders()
  formDialogVisible.value = true
}

const showEditDialog = async (row: any) => {
  if (!canEdit.value || row.status !== 'draft') return
  Object.assign(form, {
    id: row.id,
    work_order: row.work_order,
    stock_in_date: formatDate(row.stock_in_date),
    notes: row.notes || ''
  })
  await loadWorkOrders()
  if (row.work_order && !workOrderOptions.value.some(option => option.value === row.work_order)) {
    workOrderOptions.value.unshift({
      value: row.work_order,
      label: row.work_order_number || `施工单 #${row.work_order}`
    })
  }
  formDialogVisible.value = true
}

const handleFormSubmit = async () => {
  if (!form.work_order) {
    useUIStore().showWarning('请选择施工单')
    return
  }
  if (!form.stock_in_date) {
    useUIStore().showWarning('请选择入库日期')
    return
  }
  submitting.value = true
  try {
    const payload = {
      work_order: form.work_order,
      stock_in_date: form.stock_in_date,
      notes: form.notes.trim()
    }
    if (form.id) {
      await stockInAPI.update(form.id, payload)
      useUIStore().showSuccess('更新成功')
    } else {
      await stockInAPI.create(payload)
      useUIStore().showSuccess('创建成功')
    }
    formDialogVisible.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '保存入库单')
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
  currentStockIn.value = row
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
  if (!currentStockIn.value) return
  submittingAction.value = true
  try {
    await stockInAPI.submit(currentStockIn.value.id)
    useUIStore().showSuccess('提交成功')
    showSubmitDialog.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '提交入库单')
  } finally {
    submittingAction.value = false
  }
}

const handleApprove = async () => {
  if (!currentStockIn.value) return
  submittingAction.value = true
  try {
    await stockInAPI.approve(currentStockIn.value.id)
    useUIStore().showSuccess('审核成功')
    showApproveDialog.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '审核入库单')
  } finally {
    submittingAction.value = false
  }
}

const handleDelete = async () => {
  if (!currentStockIn.value) return
  deleting.value = true
  try {
    await stockInAPI.delete(currentStockIn.value.id)
    useUIStore().showSuccess('删除成功')
    showDeleteDialog.value = false
    reloadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '删除入库单')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  reloadData()
})
</script>
