<template>
  <TablePageLayout
    title="成本中心"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索成本中心编码、名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.is_active"
          :options="[{label: '启用', value: true}, {label: '禁用', value: false}]"
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
          新建成本中心
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
        <template #cell-is_active="{ value }">
          <Tag :type="value ? 'success' : 'info'">
            {{ value ? '启用' : '禁用' }}
          </Tag>
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的成本中心' : '暂无成本中心数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个成本中心' : undefined"
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
import { costCenterAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, RowActions, FilterRow, Select, Tag } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'

const columns: Column[] = [
  { key: 'code', label: '中心编码', sortable: true, class: 'w-32' },
  { key: 'name', label: '中心名称', sortable: true, class: 'w-48' },
  { key: 'department_name', label: '所属部门', sortable: true, class: 'w-40' },
  { key: 'manager_name', label: '负责人', sortable: true, class: 'w-32' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(costCenterAPI, 'getList', { errorContext: '加载成本中心数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('costcenter')

const getRowActions = (row: any): RowAction[] => {
  const actions: RowAction[] = []
  if (canEdit) {
    actions.push({ key: 'edit', label: '编辑', icon: 'edit' })
  }
  if (canDelete) {
    actions.push({ key: 'delete', label: '删除', icon: 'trash', tone: 'danger' })
  }
  return actions
}

const showCreateDialog = () => {
  useUIStore().showInfo('新建成本中心表单开发中...')
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') {
    useUIStore().showInfo('编辑成本中心表单开发中...')
  } else if (action === 'delete') {
    useUIStore().showInfo('删除成本中心对接中...')
  }
}
</script>
