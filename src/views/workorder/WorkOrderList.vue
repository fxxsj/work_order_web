<template>
  <TablePageLayout>
    <template #filters>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <SearchInput
            v-model="filters.search"
            class="w-full sm:w-72"
            placeholder="搜索施工单号、产品名称、客户"
            @search="handleSearch"
            @clear="handleSearch"
          />
          <Select
            v-model="filters.status"
            :options="statusOptions"
            placeholder="状态"
            clearable
            class="w-36"
            @change="handleSearchDebounced"
          />
          <Select
            v-model="filters.priority"
            :options="priorityOptions"
            placeholder="优先级"
            clearable
            class="w-36"
            @change="handleSearchDebounced"
          />
          <Select
            v-if="isSalesperson"
            v-model="filters.approval_status"
            :options="approvalStatusOptions"
            placeholder="审核状态"
            clearable
            class="w-36"
            @change="handleSearchDebounced"
          />
        </div>
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end gap-3 items-center">
        <button class="btn btn-secondary" title="重置筛选" @click="handleReset">
          <Icon name="refresh" size="md" class="mr-1" />
          重置
        </button>
        <button class="btn btn-success" v-if="canExport" :disabled="exporting" @click="handleExport" title="导出Excel">
          <Icon name="download" size="md" :class="exporting ? 'animate-spin' : ''" class="mr-1" />
          导出
        </button>
        <button class="btn btn-primary" @click="handleCreate" title="新建施工单">
          <Icon name="plus" size="md" class="mr-1" />
          新建
        </button>
      </div>
    </template>

    <template #table>
      <DataTable :columns="columns" :data="tableData" :loading="loading" row-key="id" @row-click="handleRowClick">
        <template #cell-order_number="{ row }"><span>{{ row.order_number }}</span></template>
        <template #cell-customer_name="{ row }"><span>{{ row.customer_name }}</span></template>
        <template #cell-salesperson_name="{ row }"><span>{{ row.salesperson_name || '-' }}</span></template>
        <template #cell-product_name="{ row }"><span>{{ row.product_name }}</span></template>
        <template #cell-production_quantity="{ row }"><span>{{ (row.production_quantity || 0) + (row.defective_quantity || 0) }} 车</span></template>
        <template #cell-status="{ row }"><StatusTag :status="row.status" category="workOrder" :label="row.status_display" /></template>
        <template #cell-priority="{ row }"><StatusTag :status="row.priority" category="priority" :label="row.priority_display" /></template>
        <template #cell-progress="{ row }"><ProgressBar :percentage="row.progress_percentage" :color="row.progress_percentage === 100 ? '#67C23A' : '#409EFF'" /></template>
        <template #cell-order_date="{ row }"><span>{{ formatDate(row.order_date) }}</span></template>
        <template #cell-delivery_date="{ row }"><span :style="getDeliveryDateStyle(row.delivery_date, row.status)">{{ formatDate(row.delivery_date) }}</span></template>
        <template #cell-manager_name="{ row }"><span>{{ row.manager_name }}</span></template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1">
            <button
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400"
              @click.stop="handleView(row)"
            >
              <Icon name="eye" size="sm" />
              <span class="text-xs">查看</span>
            </button>
            <button
              v-if="canEdit"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-dark-700 dark:hover:text-primary-400"
              @click.stop="handleEdit(row)"
            >
              <Icon name="edit" size="sm" />
              <span class="text-xs">编辑</span>
            </button>
            <button
              v-if="canDelete"
              class="flex flex-col items-center gap-0.5 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              @click.stop="handleDelete(row)"
            >
              <Icon name="trash" size="sm" />
              <span class="text-xs">删除</span>
            </button>
          </div>
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
import { ElMessage } from '@/utils/message'
import { workOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import ErrorHandler from '@/utils/errorHandler'
import logger from '@/utils/logger'
import { StatusTag, SearchInput, Select, Icon, Pagination, ProgressBar, TablePageLayout, DataTable, EmptyState, ConfirmDialog } from '@/components/common'
import type { Column } from '@/components/common/types'
import { WorkOrderStatusChoices, PriorityChoices, ApprovalStatusChoices } from '@/constants'
import { formatDate } from '@/utils/filter'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const exporting = ref(false)
const deleting = ref(false)
const ordering = ref('-created_at')
const editConfirmVisible = ref(false)
const pendingEditRow = ref<any>(null)
const deleteConfirmVisible = ref(false)
const rowToDelete = ref<any>(null)

const buildWorkOrderParams = (params: any) => ({ ordering: ordering.value, ...params })

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
  resetFilters: resetCrudFilters
} = useCrudList(workOrderAPI, 'getList', {
  initialFilters: { search: '', status: '', priority: '', approval_status: '' },
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
  { key: 'order_number', label: '施工单号', width: 144 },
  { key: 'customer_name', label: '客户', width: 144 },
  { key: 'salesperson_name', label: '业务员', width: 96 },
  { key: 'product_name', label: '产品名称', minWidth: 192 },
  { key: 'production_quantity', label: '生产数量', width: 96, align: 'right' },
  { key: 'status', label: '状态', width: 96 },
  { key: 'priority', label: '优先级', width: 96 },
  { key: 'progress', label: '进度', width: 144 },
  { key: 'order_date', label: '下单日期', width: 112 },
  { key: 'delivery_date', label: '交货日期', width: 112 },
  { key: 'manager_name', label: '制表人', width: 96 },
  { key: 'actions', label: '操作', width: 176, fixed: 'right' }
]

const statusOptions = computed(() => WorkOrderStatusChoices.map((c: any) => ({ value: c.value, label: c.label })))
const priorityOptions = computed(() => PriorityChoices.map((c: any) => ({ value: c.value, label: c.label })))
const approvalStatusOptions = computed(() => ApprovalStatusChoices.map((c: any) => ({ value: c.value, label: c.label })))

const handleReset = () => {
  ordering.value = '-created_at'
  if (Object.keys(route.query).length > 0) {
    router.replace({ query: {} }).catch(err => {
      if (err.name !== 'NavigationDuplicated') logger.warn('导航错误', err)
    })
  }
  resetCrudFilters()
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

const getDeliveryDateStyle = (date: any, status: any) => {
  if (status === 'completed' || status === 'cancelled') return {}
  const diffDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { color: '#F56C6C', fontWeight: 'bold' }
  if (diffDays <= 3) return { color: '#E6A23C', fontWeight: 'bold' }
  return {}
}

const handleExport = async () => {
  try {
    exporting.value = true
    const params = {}
    if ((filters.value as any).search) (params as any).search = filters.value.search
    if ((filters.value as any).status) (params as any).status = filters.value.status
    if ((filters.value as any).priority) (params as any).priority = filters.value.priority
    if ((filters.value as any).approval_status) (params as any).approval_status = filters.value.approval_status
    const now = new Date()
    const filename = `施工单列表_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;
    (params as any).filename = filename
    const response: any = await workOrderAPI.export(params)
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error: any) {
    if (error.response && error.response.data) {
      const reader = new FileReader()
      reader.onload = () => { ErrorHandler.showMessage({ message: reader.result }, '导出') }
      reader.readAsText(error.response.data)
    } else {
      ErrorHandler.showMessage(error, '导出')
    }
  } finally {
    exporting.value = false
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
      'order_number', '-order_number'
    ])
    const orderingVal = route.query.ordering as string
    if (allowedOrdering.has(orderingVal)) {
      ordering.value = orderingVal
    }
  }
  loadData()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.filter-section {
  margin-bottom: var(--ui-section-gap);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-control-gap);
}

.workorder-skeleton,
.table-scroll {
  margin-top: var(--ui-section-gap);
}

.table-scroll {
  overflow-x: auto;
}

.workorder-table {
  width: 100%;
}

.data-table {
  cursor: pointer;
}

@media (max-width: bp.$breakpoint-phone-max) {
  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
