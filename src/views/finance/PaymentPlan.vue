<template>
  <TablePageLayout
    title="收款计划"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索计划编号、客户名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.status"
          :options="statusOptions"
          class="w-full sm:w-36"
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
          新建收款计划
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
            category="payment"
            :label="row.status_display"
          />
        </template>
        <template #cell-amount="{ value }">
          <span class="text-right text-green-600 font-semibold">¥{{ value ? Number(value).toFixed(2) : '0.00' }}</span>
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的收款计划' : '暂无收款计划数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个收款计划' : undefined"
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { paymentPlanAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, RowActions, FilterRow, Select, StatusTag } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'

const columns: Column[] = [
  { key: 'plan_no', label: '计划编号', sortable: true, class: 'w-32' },
  { key: 'customer_name', label: '客户', sortable: true, class: 'w-48' },
  { key: 'related_order', label: '关联订单', sortable: true, class: 'w-32' },
  { key: 'amount', label: '计划金额', sortable: true, class: 'w-32 text-right' },
  { key: 'expected_date', label: '预计收款日期', sortable: true, class: 'w-32' },
  { key: 'status', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'owner_name', label: '负责人', sortable: true, class: 'w-24' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const statusOptions = [
  { label: '待收款', value: 'pending' },
  { label: '部分收款', value: 'partial' },
  { label: '已完成', value: 'completed' },
  { label: '已逾期', value: 'overdue' }
]

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(paymentPlanAPI, 'getList', { errorContext: '加载收款计划数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('paymentplan')

const getRowActions = (row: any): RowAction[] => {
  const actions: RowAction[] = []
  if (canEdit && row.status !== 'completed') {
    actions.push({ key: 'edit', label: '编辑', icon: 'edit' })
    actions.push({ key: 'receive', label: '登记收款', icon: 'dollar' })
  }
  if (canDelete && row.status === 'pending') {
    actions.push({ key: 'delete', label: '删除', icon: 'trash', tone: 'danger' })
  }
  return actions
}

const showCreateDialog = () => {
  useUIStore().showInfo('新建收款计划表单开发中...')
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') {
    useUIStore().showInfo('编辑收款计划表单开发中...')
  } else if (action === 'delete') {
    useUIStore().showInfo('删除收款计划对接中...')
  } else if (action === 'receive') {
    useUIStore().showInfo('登记收款功能开发中...')
  }
}
</script
