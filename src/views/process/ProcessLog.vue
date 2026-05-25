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
          v-model="filters.action"
          :options="actionOptions"
          class="w-32"
          placeholder="操作动作"
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
      </div>
    </template>

    <template #table>
      <DataTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :row-key="(row: any) => row.id"
      >
        <template #cell-action="{ value }">
          <Tag :type="getActionTagType(value)">
            {{ getActionLabel(value) }}
          </Tag>
        </template>
        <template #cell-details="{ value }">
          <span class="text-gray-500 text-sm truncate max-w-xs block">{{ value }}</span>
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
</template>

<script setup lang="ts">
import { processLogAPI } from '@/api/modules'
import { useCrudList } from '@/composables'
import { TablePageLayout, DataTable, EmptyState, SearchInput, Icon, Pagination, FilterRow, Select, Tag } from '@/components/common'
import type { Column } from '@/components/common/types'

const columns: Column[] = [
  { key: 'work_order_number', label: '施工单号', sortable: true, class: 'w-32' },
  { key: 'process_name', label: '工序名称', sortable: true, class: 'w-40' },
  { key: 'operator_name', label: '操作人', sortable: true, class: 'w-32' },
  { key: 'action', label: '动作', sortable: true, class: 'w-24 text-center' },
  { key: 'details', label: '操作详情', sortable: false },
  { key: 'created_at', label: '记录时间', sortable: true, class: 'w-48' }
]

const actionOptions = [
  { label: '开始', value: 'start' },
  { label: '暂停', value: 'pause' },
  { label: '继续', value: 'resume' },
  { label: '完成', value: 'finish' },
  { label: '质检', value: 'inspect' }
]

const getActionLabel = (action: string) => {
  const opt = actionOptions.find(o => o.value === action)
  return opt ? opt.label : action
}

const getActionTagType = (action: string) => {
  switch (action) {
    case 'start': return 'primary'
    case 'finish': return 'success'
    case 'pause': return 'warning'
    case 'resume': return 'info'
    case 'inspect': return 'primary'
    default: return 'info'
  }
}

const {
  searchText, filters, tableData, loading, total, currentPage, pageSize,
  loadData, handleSearch, handlePageChange, handleSizeChange, hasFilters
} = useCrudList(processLogAPI, 'getList', { errorContext: '加载工序日志失败' })

</script>
