<template>
  <TablePageLayout title="成本项目" :loading="loading">
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索成本项目编码、名称"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.cost_type"
          :options="typeOptions"
          class="w-32"
          placeholder="费用类型"
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
          新建成本项目
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
          <Tag :type="value ? 'success' : 'info'">{{ value ? '启用' : '禁用' }}</Tag>
        </template>
        <template #cell-default_amount="{ value }">
          <span class="text-right">¥{{ value ? Number(value).toFixed(2) : '0.00' }}</span>
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的成本项目' : '暂无成本项目数据'"
            :action-text="canCreate && !hasFilters ? '创建第一个成本项目' : undefined"
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
import { costItemAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, RowActions, FilterRow, Select, Tag } from '@/components/common'
import type { Column } from '@/components/common/types'
import { ElMessage } from '@/utils/message'

const columns: Column[] = [
  { key: 'code', label: '项目编码', sortable: true, class: 'w-32' },
  { key: 'name', label: '项目名称', sortable: true, class: 'w-48' },
  { key: 'cost_type_display', label: '费用类型', sortable: true, class: 'w-32' },
  { key: 'default_amount', label: '默认金额', sortable: true, class: 'w-32 text-right' },
  { key: 'is_active', label: '状态', sortable: true, class: 'w-24 text-center' },
  { key: 'description', label: '描述', sortable: false },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const typeOptions = [
  { label: '人工费', value: 'labor' },
  { label: '材料费', value: 'material' },
  { label: '制造费用', value: 'manufacturing' },
  { label: '其他费用', value: 'other' }
]

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(costItemAPI, 'getList', { errorContext: '加载成本项目数据失败' })

const { canCreate, canEdit, canDelete } = useCrudPermission('costitem')

const getRowActions = (row: any) => {
  const actions = []
  if (canEdit) {
    actions.push({ key: 'edit', label: '编辑', icon: 'edit' })
  }
  if (canDelete) {
    actions.push({ key: 'delete', label: '删除', icon: 'trash', tone: 'danger' })
  }
  return actions
}

const showCreateDialog = () => {
  ElMessage.info('新建成本项目表单开发中...')
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'edit') {
    ElMessage.info('编辑成本项目表单开发中...')
  } else if (action === 'delete') {
    ElMessage.info('删除成本项目对接中...')
  }
}
</script>
