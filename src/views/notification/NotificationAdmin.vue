<template>
  <TablePageLayout title="系统通知管理" :loading="loading">
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索通知标题、接收人"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.type"
          :options="typeOptions"
          class="w-32"
          placeholder="通知类型"
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
          发布系统通知
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
        <template #cell-type="{ value }">
          <Tag :type="value === 'system' ? 'danger' : 'info'">{{ value === 'system' ? '系统广播' : '业务提醒' }}</Tag>
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的通知' : '暂无系统通知数据'"
            :action-text="canCreate && !hasFilters ? '发布第一条通知' : undefined"
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
import { notificationAPI } from '@/api/modules'
import { useCrudList, useCrudPermission } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, RowActions, FilterRow, Select, Tag } from '@/components/common'
import type { Column } from '@/components/common/types'
import { ElMessage } from '@/utils/message'

const columns: Column[] = [
  { key: 'title', label: '通知标题', sortable: true, class: 'w-64' },
  { key: 'type', label: '类型', sortable: true, class: 'w-32' },
  { key: 'target_users', label: '接收范围', sortable: false, class: 'w-48' },
  { key: 'publisher_name', label: '发布人', sortable: true, class: 'w-32' },
  { key: 'created_at', label: '发布时间', sortable: true, class: 'w-48' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-32' }
]

const typeOptions = [
  { label: '系统广播', value: 'system' },
  { label: '业务提醒', value: 'business' }
]

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(notificationAPI, 'getList', { errorContext: '加载系统通知失败' })

// Notice: admin notification might use specific permission string
const { canCreate, canEdit, canDelete } = useCrudPermission('systemnotificationsettings')

const getRowActions = (row: any) => {
  const actions = []
  if (canDelete) {
    actions.push({ key: 'delete', label: '撤回', icon: 'trash', tone: 'danger' })
  }
  return actions
}

const showCreateDialog = () => {
  ElMessage.info('发布系统通知弹窗开发中...')
}

const handleRowAction = (action: string, row: any) => {
  if (action === 'delete') {
    ElMessage.info('撤回通知功能开发中...')
  }
}
</script
