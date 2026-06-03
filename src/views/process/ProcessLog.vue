<template>
  <TablePageLayout
    title="工序日志"
    :loading="loading"
  >
    <template #filters>
      <FilterRow>
        <SearchInput
          v-model="searchText"
          class="w-full sm:w-72"
          placeholder="搜索施工单号、工序名称、操作人"
          @search="handleSearch"
          @clear="handleSearch"
        />
        <Select
          v-model="filters.log_type"
          :options="actionOptions"
          class="w-full sm:w-36"
          placeholder="日志类型"
          clearable
          @change="handleSearch"
        />
      </FilterRow>
    </template>
    
    <template #actions>
      <div class="flex justify-end gap-3">
        <BaseButton
          v-if="hasFilters"
          variant="secondary"
          @click="resetFilters"
        >
          重置筛选
        </BaseButton>
        <BaseButton
          variant="secondary"
          icon="refresh"
          title="刷新"
          :loading="loading"
          @click="loadData"
        />
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
      >
        <template #cell-log_type="{ value }">
          <Tag :type="getActionTagType(value)">
            {{ getActionLabel(value) }}
          </Tag>
        </template>
        <template #cell-content="{ value }">
          <span class="text-gray-500 text-sm truncate max-w-xs block">{{ value }}</span>
        </template>
        <template #cell-created_at="{ value }">
          {{ formatDateTime(value) }}
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="action => handleRowAction(action.key, row)"
          />
        </template>
        <template #empty>
          <EmptyState
            :description="hasFilters ? '未找到匹配的日志' : '暂无工序日志数据'"
            @action="handleSearch"
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

  <BaseDialog
    :show="detailDialogVisible"
    title="工序日志详情"
    width="wide"
    @close="detailDialogVisible = false"
  >
    <DescriptionGrid
      v-if="currentRow"
      :columns="2"
    >
      <DescriptionItem label="施工单">
        {{ currentRow.work_order_number || '-' }}
      </DescriptionItem>
      <DescriptionItem label="工序">
        {{ currentRow.process_name || currentRow.work_order_process_label || '-' }}
      </DescriptionItem>
      <DescriptionItem label="日志类型">
        {{ currentRow.log_type_display || getActionLabel(currentRow.log_type) }}
      </DescriptionItem>
      <DescriptionItem label="操作人">
        {{ currentRow.operator_name || '-' }}
      </DescriptionItem>
      <DescriptionItem label="记录时间">
        {{ formatDateTime(currentRow.created_at) }}
      </DescriptionItem>
      <DescriptionItem label="工序编码">
        {{ currentRow.process_code || '-' }}
      </DescriptionItem>
      <DescriptionItem
        label="内容"
        :span="2"
      >
        {{ currentRow.content || '-' }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="detailDialogVisible = false"
      >
        关闭
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { processLogAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import {
  BaseDialog,
  DataTable,
  DescriptionGrid,
  DescriptionItem,
  EmptyState,
  FilterRow,
  BaseButton,
  Pagination,
  RowActions,
  SearchInput,
  Select,
  TablePageLayout,
  Tag
} from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'

const columns: Column[] = [
  { key: 'work_order_number', label: '施工单号', sortable: true, class: 'w-32' },
  { key: 'process_name', label: '工序名称', sortable: true, class: 'w-40' },
  { key: 'operator_name', label: '操作人', sortable: true, class: 'w-32' },
  { key: 'log_type', label: '类型', sortable: true, class: 'w-24 text-center' },
  { key: 'content', label: '内容', sortable: false },
  { key: 'created_at', label: '记录时间', sortable: true, class: 'w-48' },
  { key: 'actions', label: '操作', sortable: false, class: 'w-24' }
]

const actionOptions = [
  { label: '开始', value: 'start' },
  { label: '暂停', value: 'pause' },
  { label: '恢复', value: 'resume' },
  { label: '完成', value: 'complete' },
  { label: '备注', value: 'note' }
]

const sortKey = ref('created_at')
const sortOrder = ref<'asc' | 'desc'>('desc')
const currentRow = ref<any>(null)
const detailDialogVisible = ref(false)
const sortFieldMap: Record<string, string> = {
  work_order_number: 'work_order_process__work_order__order_number',
  process_name: 'work_order_process__process__name',
  operator_name: 'operator__username'
}
const buildParams = (params: Record<string, unknown>) => {
  const backendSortKey = sortFieldMap[sortKey.value] || sortKey.value
  return {
    ...params,
    ordering: sortOrder.value === 'desc' ? `-${backendSortKey}` : backendSortKey
  }
}

const getActionLabel = (action: string) => {
  const opt = actionOptions.find(o => o.value === action)
  return opt ? opt.label : action
}

const getActionTagType = (action: string) => {
  switch (action) {
    case 'start': return 'primary'
    case 'complete': return 'success'
    case 'pause': return 'warning'
    case 'resume': return 'info'
    case 'note': return 'info'
    default: return 'info'
  }
}

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters, resetFilters
} = useCrudList(processLogAPI, 'getList', {
  initialFilters: { log_type: '' },
  buildParams,
  errorContext: '加载工序日志失败'
})

const formatDateTime = (value: string | null | undefined) => value ? String(value).replace('T', ' ').slice(0, 19) : '-'

const handleSort = (key: string, order: 'asc' | 'desc') => {
  sortKey.value = key
  sortOrder.value = order
  currentPage.value = 1
  loadData()
}

const getRowActions = (_row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' }
]

const handleRowAction = (action: string, row: any) => {
  if (action === 'view') {
    currentRow.value = row
    detailDialogVisible.value = true
  }
}

</script>
