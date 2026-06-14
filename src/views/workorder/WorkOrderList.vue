<template>
  <TablePageLayout>
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="filters.search"
          class="w-full sm:w-64"
          placeholder="搜索施工单号、产品名称、客户"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          placeholder="施工单状态"
          clearable
          class="w-full sm:w-32"
          @change="handleSearch"
        />
        <Select
          v-model="filters.priority"
          :options="priorityOptions"
          placeholder="优先级"
          clearable
          class="w-full sm:w-32"
          @change="handleSearch"
        />
        <DateRangePicker
          v-model="orderDateRange"
          class="w-full sm:w-[200px]"
          start-placeholder="下单起"
          end-placeholder="下单止"
          @change="handleSearch"
        />
        <DateRangePicker
          v-model="deliveryDateRange"
          class="w-full sm:w-[200px]"
          start-placeholder="交货起"
          end-placeholder="交货止"
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
      <div class="flex justify-end gap-3 items-center w-full">
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
        <BaseButton
          v-if="canExport"
          variant="success"
          icon="download"
          :loading="exporting"
          title="导出Excel"
          @click="handleExport"
        >
          导出
        </BaseButton>
        <BaseButton
          variant="primary"
          icon="plus"
          title="新建施工单"
          @click="handleCreate"
        >
          新建
        </BaseButton>
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        row-key="id"
        :server-side-sort="true"
        default-sort-key="created_at"
        default-sort-order="desc"
        @sort="handleSort"
        @row-click="handleRowClick"
      >
        <template #cell-order_number="{ row }">
          <span>{{ row.order_number }}</span>
        </template>
        <template #cell-customer_name="{ row }">
          <span>{{ row.customer_name }}</span>
        </template>
        <template #cell-salesperson_name="{ row }">
          <span>{{ row.salesperson_name || '-' }}</span>
        </template>
        <template #cell-product_name="{ row }">
          <span>{{ row.product_name }}</span>
        </template>
        <template #cell-production_quantity="{ row }">
          <span>{{ (row.production_quantity || 0) + (row.defective_quantity || 0) }} 车</span>
        </template>
        <template #cell-status="{ row }">
          <StatusTag
            :status="['draft', 'submitted', 'rejected'].includes(row.approval_status) ? row.approval_status : row.status"
            category="workOrder"
          />
        </template>
        <template #cell-priority="{ row }">
          <StatusTag
            :status="row.priority"
            category="priority"
            :label="row.priority_display"
          />
        </template>
        <template #cell-progress="{ row }">
          <ProgressBar
            :percentage="row.progress_percentage"
            :status="row.progress_percentage === 100 ? 'success' : 'active'"
          />
        </template>
        <template #cell-order_date="{ row }">
          <span>{{ formatDate(row.order_date) }}</span>
        </template>
        <template #cell-delivery_date="{ row }">
          <span :style="getDeliveryDateStyle(row.delivery_date, row.status)">{{ formatDate(row.delivery_date) }}</span>
        </template>
        <template #cell-manager_name="{ row }">
          <span>{{ row.manager_name }}</span>
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="(action) => handleRowAction(action, row)"
          />
        </template>
        <template #empty>
          <EmptyState description="暂无施工单数据" />
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

  <ConfirmDialog
    :show="editConfirmVisible"
    title="编辑已审核的施工单"
    message="该施工单已审核通过。核心字段（产品、工序、版选择等）不能修改，非核心字段（备注、交货日期等）可以修改。确定要继续编辑吗？"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="handleEditConfirm"
    @cancel="handleEditCancel"
  />

  <ConfirmDialog
    :show="deleteConfirmVisible"
    title="删除确认"
    :message="`确定要删除施工单 ${rowToDelete?.order_number} 吗？`"
    confirm-text="删除"
    cancel-text="取消"
    :danger="true"
    :loading="deleting"
    loading-text="删除中..."
    @confirm="handleConfirmDelete"
    @cancel="deleteConfirmVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUIStore } from '@/stores/ui'
import { workOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList, useCrudPermission, useCRUD, useExport } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import { BaseButton, StatusTag, SearchInput, Select, DateRangePicker, Pagination, ProgressBar, TablePageLayout, DataTable, EmptyState, ConfirmDialog, RowActions, FilterRow } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { WorkOrderStatusChoices, PriorityChoices, ApprovalStatusChoices } from '@/constants'
import { formatDate } from '@/utils/filter'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const deleting = ref(false)
const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const editConfirmVisible = ref(false)
const pendingEditRow = ref<any>(null)
const deleteConfirmVisible = ref(false)
const rowToDelete = ref<any>(null)

const sortFieldMap: Record<string, string> = {
  customer_name: 'customer__name',
  salesperson_name: 'customer__salesperson__username',
  product_name: 'products__product__name',
  manager_name: 'manager__username'
}

const buildWorkOrderParams = (params: any) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  const ordering = sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  
  const nextParams = { ...params, ordering }
  if (nextParams.status) {
    if (nextParams.status === 'approval_draft') {
      nextParams.approval_status = 'draft'
      delete nextParams.status
    } else if (['submitted', 'approved', 'rejected'].includes(nextParams.status)) {
      nextParams.approval_status = nextParams.status
      delete nextParams.status
    }
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
  loadData,
  handleSearch,
  handlePageChange,
  handleSizeChange,
  resetFilters: resetCrudFilters
} = useCrudList(workOrderAPI, 'getList', {
  initialFilters: {
    search: '',
    status: '',
    priority: '',
    approval_status: '',
    order_date_after: '',
    order_date_before: '',
    delivery_date_after: '',
    delivery_date_before: ''
  },
  buildParams: buildWorkOrderParams,
  errorContext: '加载施工单失败'
})

const { canEdit, canDelete } = useCrudPermission('workorder')

const crud = useCRUD(workOrderAPI, {
  onSuccess: () => loadData(),
})

const isSalesperson = computed(() => {
  return userStore.isSalesperson
})

const canExport = computed(() => userStore.hasPermission('workorder.view_workorder'))

const columns: Column[] = [
  { key: 'order_number', label: '施工单号', width: 144, sortable: true },
  { key: 'customer_name', label: '客户', width: 144, sortable: true },
  { key: 'salesperson_name', label: '业务员', width: 96, sortable: true },
  { key: 'product_name', label: '产品名称', minWidth: 192, sortable: true },
  { key: 'production_quantity', label: '生产数量', width: 96, align: 'right', sortable: true },
  { key: 'status', label: '状态', width: 96, sortable: true },
  { key: 'priority', label: '优先级', width: 96, sortable: true },
  { key: 'progress', label: '进度', width: 144 },
  { key: 'order_date', label: '下单日期', width: 112, sortable: true },
  { key: 'delivery_date', label: '交货日期', width: 112, sortable: true },
  { key: 'manager_name', label: '制表人', width: 96, sortable: true },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

const statusOptions = [
  { value: 'approval_draft', label: '草稿' },
  { value: 'submitted', label: '待审核' },
  { value: 'approved', label: '已审核' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'paused', label: '已暂停' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]
const priorityOptions = computed(() => PriorityChoices.map((c: any) => ({ value: c.value, label: c.label })))

const orderDateRange = computed<[string, string]>({
  get: (): [string, string] => [String(filters.value.order_date_after || ''), String(filters.value.order_date_before || '')],
  set: ([start, end]: [string, string]) => {
    filters.value.order_date_after = start
    filters.value.order_date_before = end
  }
})

const deliveryDateRange = computed<[string, string]>({
  get: (): [string, string] => [String(filters.value.delivery_date_after || ''), String(filters.value.delivery_date_before || '')],
  set: ([start, end]: [string, string]) => {
    filters.value.delivery_date_after = start
    filters.value.delivery_date_before = end
  }
})

const handleReset = () => {
  sortKey.value = 'created_at'
  sortOrder.value = 'desc'
  if (Object.keys(route.query).length > 0) {
    router.replace({ query: {} }).catch(err => {
      if (err.name !== 'NavigationDuplicated') logger.warn('导航错误', err)
    })
  }
  resetCrudFilters()
}

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const handleCreate = () => {
  router.push('/workorders/create')
}

const handleView = (row: any) => {
  router.push(`/workorders/${row.id}`)
}

const handleEdit = (row: any) => {
  if (row.approval_status === 'approved') {
    pendingEditRow.value = row
    editConfirmVisible.value = true
  } else {
    router.push(`/workorders/${row.id}/edit`)
  }
}

const handleEditConfirm = () => {
  editConfirmVisible.value = false
  if (pendingEditRow.value) {
    router.push(`/workorders/${pendingEditRow.value.id}/edit`)
  }
  pendingEditRow.value = null
}

const handleEditCancel = () => {
  editConfirmVisible.value = false
  pendingEditRow.value = null
}

const handleRowClick = (row: any) => {
  handleView(row)
}

const handleDelete = (row: any) => {
  rowToDelete.value = row
  deleteConfirmVisible.value = true
}

const handleConfirmDelete = async () => {
  if (!rowToDelete.value) return
  try {
    deleting.value = true
    await crud.remove(rowToDelete.value.id, '删除成功')
  } catch (error: any) {
    ErrorHandler.showMessage(error, '删除施工单')
  } finally {
    deleting.value = false
    deleteConfirmVisible.value = false
    rowToDelete.value = null
  }
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
    case 'delete': handleDelete(row); break
  }
}

const DELIVERY_DATE_WARNING_DAYS = 3
const DELIVERY_DATE_DANGER_COLOR = '#ef4444'
const DELIVERY_DATE_WARNING_COLOR = '#f59e0b'

const getDeliveryDateStyle = (date: any, status: any) => {
  if (status === 'completed' || status === 'cancelled') return {}
  const diffDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { color: DELIVERY_DATE_DANGER_COLOR, fontWeight: 'bold' }
  if (diffDays <= DELIVERY_DATE_WARNING_DAYS) return { color: DELIVERY_DATE_WARNING_COLOR, fontWeight: 'bold' }
  return {}
}

const { exporting, exportData } = useExport(
  (params) => workOrderAPI.export(params),
  { fileNamePrefix: '施工单列表', fileExtension: 'xlsx' }
)

const handleExport = async () => {
  const params = {}
  if ((filters.value as any).search) (params as any).search = filters.value.search
  if ((filters.value as any).status) (params as any).status = filters.value.status
  if ((filters.value as any).priority) (params as any).priority = filters.value.priority
  if ((filters.value as any).approval_status) (params as any).approval_status = filters.value.approval_status
  if ((filters.value as any).order_date_after) (params as any).order_date_after = filters.value.order_date_after
  if ((filters.value as any).order_date_before) (params as any).order_date_before = filters.value.order_date_before
  if ((filters.value as any).delivery_date_after) (params as any).delivery_date_after = filters.value.delivery_date_after
  if ((filters.value as any).delivery_date_before) (params as any).delivery_date_before = filters.value.delivery_date_before
  const now = new Date()
  const filename = `施工单列表_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`
  ;(params as any).filename = filename
  try {
    const success = await exportData(params, filename)
    if (success) {
      useUIStore().showSuccess('导出成功')
    }
  } catch (error: any) {
    if (error.response && error.response.data) {
      const reader = new FileReader()
      reader.onload = () => { ErrorHandler.showMessage({ message: reader.result }, '导出') }
      reader.readAsText(error.response.data)
    } else {
      ErrorHandler.showMessage(error, '导出')
    }
  }
}

onMounted(() => {
  if (route.query.approval_status) {
    filters.value.approval_status = route.query.approval_status
  }
  if (route.query.status) {
    filters.value.status = route.query.status
  }
  if (route.query.priority) {
    filters.value.priority = route.query.priority
  }
  if (route.query.ordering) {
    const allowedOrdering = new Set([
      'created_at', '-created_at',
      'order_date', '-order_date',
      'delivery_date', '-delivery_date',
      'order_number', '-order_number',
      'customer__name', '-customer__name',
      'status', '-status',
      'priority', '-priority',
      'approval_status', '-approval_status',
      'total_amount', '-total_amount'
    ])
    const orderingVal = route.query.ordering as string
    if (allowedOrdering.has(orderingVal)) {
      sortOrder.value = orderingVal.startsWith('-') ? 'desc' : 'asc'
      const backendKey = orderingVal.replace(/^-/, '')
      sortKey.value = Object.entries(sortFieldMap).find(([, value]) => value === backendKey)?.[0] || backendKey
    }
  }
  loadData()
})
</script>
