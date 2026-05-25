<template>
  <TablePageLayout title="出库单" :loading="loading">
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索出库单号、客户、相关单号"
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
        <button @click="loadData" :disabled="loading" class="btn btn-secondary" title="刷新">
          <Icon name="refresh" size="md" :class="loading ? 'animate-spin' : ''" />
        </button>
        <button v-if="canCreate" class="btn btn-primary" @click="showCreateDialog">
          <Icon name="plus" size="md" class="mr-2" />
          新建出库单
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
          <StatusTag :status="row.status" category="stock" :label="row.status_display" />
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

  <!-- Approve Confirmation -->
  <ConfirmDialog
    :show="showApproveDialog"
    title="审核出库单"
    :message="`确定要审核通过出库单「${currentStockOut?.order_number}」吗？审核后库存将被相应扣减。`"
    confirm-text="审核通过"
    cancel-text="取消"
    @confirm="handleApprove"
    @cancel="showApproveDialog = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { stockOutAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, ConfirmDialog, Pagination, RowActions, FilterRow, Select, StatusTag } from '@/components/common'
import type { Column } from '@/components/common/types'
import { ElMessage } from '@/utils/message'
import ErrorHandler from '@/utils/errorHandler'

const columns: Column[] = [
  { key: 'order_number', label: '出库单号', sortable: true, class: 'w-32' },
  { key: 'customer_name', label: '客户', sortable: true, class: 'w-40' },
  { key: 'related_order', label: '相关单号', sortable: true, class: 'w-32' },
  { key: 'stock_out_date', label: '出库日期', sortable: true, class: 'w-32' },
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
} = useCrudList(stockOutAPI, 'getList', { errorContext: '加载出库单数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('stockout')

const showApproveDialog = ref(false)
const currentStockOut = ref<any>(null)

const getRowActions = (row: any) => {
  const actions = []
  if (canEdit) {
    actions.push({ key: 'edit', label: '编辑', icon: 'edit' })
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
  ElMessage.info('新建出库单表单正在开发中...')
}

const handleRowAction = (action: string, row: any) => {
  currentStockOut.value = row
  switch (action) {
    case 'edit':
      ElMessage.info('编辑表单正在开发中...')
      break
    case 'delete':
      ElMessage.info('删除功能正在对接中...')
      break
    case 'approve':
      showApproveDialog.value = true
      break
  }
}

const handleApprove = async () => {
  if (!currentStockOut.value) return
  try {
    await stockOutAPI.approve(currentStockOut.value.id)
    ElMessage.success('审核成功')
    showApproveDialog.value = false
    loadData()
  } catch (error) {
    ErrorHandler.showMessage(error, '审核出库单')
  }
}
</script>
