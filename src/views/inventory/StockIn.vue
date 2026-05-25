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
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          class="w-32"
          placeholder="状态"
          clearable
          @change="handleSearch"
        />
      </FilterRow>
    </template>
    
    <template #actions>
      <div class="flex justify-end gap-3">
        <button
          :disabled="loading"
          class="btn btn-secondary"
          title="刷新"
          @click="loadData"
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
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
      >
        <template #cell-status="{ row }">
          <StatusTag
            :status="row.status"
            category="stock"
            :label="row.status_display"
          />
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

  <!-- Submit Confirmation -->
  <ConfirmDialog
    :show="showSubmitDialog"
    title="提交入库单"
    :message="`确定要提交入库单「${currentStockIn?.order_number}」吗？提交后将进入审核流程。`"
    confirm-text="提交"
    cancel-text="取消"
    @confirm="handleSubmit"
    @cancel="showSubmitDialog = false"
  />

  <!-- Approve Confirmation -->
  <ConfirmDialog
    :show="showApproveDialog"
    title="审核入库单"
    :message="`确定要审核通过入库单「${currentStockIn?.order_number}」吗？审核后库存将被相应增加。`"
    confirm-text="审核通过"
    cancel-text="取消"
    @confirm="handleApprove"
    @cancel="showApproveDialog = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { stockInAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, ConfirmDialog, Pagination, RowActions, FilterRow, Select, StatusTag } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'order_number', label: '入库单号', sortable: true, class: 'w-32' },
  { key: 'customer_name', label: '客户', sortable: true, class: 'w-40' },
  { key: 'work_order_number', label: '施工单号', sortable: true, class: 'w-32' },
  { key: 'stock_in_date', label: '入库日期', sortable: true, class: 'w-32' },
  { key: 'status', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'operator_name', label: '操作员', sortable: true, class: 'w-24' },
  { key: 'created_at', label: '创建时间', sortable: true, class: 'w-40' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-48' }
]

const statusOptions = [
  { label: '待提交', value: 'draft' },
  { label: '待审核', value: 'submitted' },
  { label: '已完成', value: 'completed' }
]

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(stockInAPI, 'getList', { errorContext: '加载入库单数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('stockin')

const showSubmitDialog = ref(false)
const showApproveDialog = ref(false)
const currentStockIn = ref<any>(null)

const getRowActions = (row: any): RowAction[] => {
  const actions: RowAction[] = []
  if (canEdit) {
    actions.push({ key: 'edit', label: '编辑', icon: 'edit' })
  }
  if (row.status === 'draft') {
    actions.push({ key: 'submit', label: '提交', icon: 'send' })
  }
  if (row.status === 'submitted') {
    actions.push({ key: 'approve', label: '审核', icon: 'checkCircle' })
  }
  if (canDelete && row.status === 'draft') {
    actions.push({ key: 'delete', label: '删除', icon: 'trash', tone: 'danger' })
  }
  return actions
}

const showCreateDialog = () => {
  useUIStore().showInfo('新建入库单表单正在开发中...')
}

const handleRowAction = (action: string, row: any) => {
  currentStockIn.value = row
  switch (action) {
    case 'edit':
      useUIStore().showInfo('编辑表单正在开发中...')
      break
    case 'delete':
      useUIStore().showInfo('删除功能正在对接中...')
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
  try {
    await stockInAPI.submit(currentStockIn.value.id)
    useUIStore().showSuccess('提交成功')
    showSubmitDialog.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '提交入库单')
  }
}

const handleApprove = async () => {
  if (!currentStockIn.value) return
  try {
    await stockInAPI.approve(currentStockIn.value.id)
    useUIStore().showSuccess('审核成功')
    showApproveDialog.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '审核入库单')
  }
}
</script>
