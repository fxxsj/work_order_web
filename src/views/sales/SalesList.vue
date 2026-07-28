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
            :status="getSalesOrderUserStatus(row)"
            category="salesOrderUser"
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
            @action="(action) => handleRowAction(action, row)"
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

  <ConfirmDialog
    :show="deleteConfirmVisible"
    title="删除确认"
    :message="`确定要删除客户订单「${rowToDelete?.order_number}」吗？此操作不可撤销。`"
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
import { useRouter } from 'vue-router'
import { salesOrderAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import { useCrudList, useCrudPermission, useCRUD } from '@/composables'
import { BaseButton, StatusTag, EmptyState, Pagination, Icon, SearchInput, Select, Tag, TablePageLayout, DataTable, FilterRow, RowActions, ConfirmDialog } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { getSalesOrderUserStatus } from '@/constants/statusMeta'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const userStore = useUserStore()

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
  { key: 'actions', label: '操作', width: 120, align: 'center', sortable: false }
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
const { canEdit, canDelete } = useCrudPermission('salesorder')
const crud = useCRUD(salesOrderAPI, { onSuccess: () => { loadData() } })

// 仅草稿态可编辑/删除（与详情页门禁一致：已提交/已审核等状态不允许直接改）
const isEditable = (row: any) => row.approval_status === 'draft'
const rowToDelete = ref<any>(null)
const deleteConfirmVisible = ref(false)
const deleting = ref(false)

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
    ErrorHandler.showMessage(error, '删除客户订单失败')
  } finally {
    deleting.value = false
    deleteConfirmVisible.value = false
    rowToDelete.value = null
  }
}

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: canEdit.value && isEditable(row) },
  { key: 'delete', label: '删除', icon: 'trash', tone: 'danger', visible: canDelete.value && isEditable(row) }
]

const handleRowAction = (action: RowAction, row: any) => {
  switch (action.key) {
    case 'view': handleView(row); break
    case 'edit': handleEdit(row); break
    case 'delete': handleDelete(row); break
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
