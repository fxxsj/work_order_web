<template>
  <div class="space-y-6">
    <!-- 页面头部 -->
    <div v-if="title || $slots.header" class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <h2 v-if="title" class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <slot name="header"></slot>
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-3">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 筛选/搜索区域 -->
    <div v-if="$slots.filter || $slots.search" class="card p-5">
      <slot name="filter"></slot>
      <slot name="search"></slot>
    </div>

    <!-- 工具栏区域 -->
    <div v-if="showToolbar || $slots.toolbar" class="flex flex-wrap items-center gap-3">
      <slot name="toolbar">
        <button
          v-if="showCreate"
          class="btn btn-primary"
          @click="$emit('create')"
        >
          <Icon name="plus" size="sm" />
          {{ createText }}
        </button>
        <button
          v-if="showExport"
          class="btn btn-success"
          @click="$emit('export')"
        >
          <Icon name="download" size="sm" />
          导出
        </button>
        <button
          v-if="showRefresh"
          class="btn btn-secondary"
          @click="$emit('refresh')"
        >
          <Icon name="refresh" size="sm" />
          刷新
        </button>
      </slot>
    </div>

    <!-- 内容区域 -->
    <div v-loading="loading" class="card min-w-0 overflow-x-auto">
      <slot></slot>
    </div>

    <!-- 分页区域 -->
    <div v-if="showPagination" class="w-full">
      <slot name="pagination">
        <Pagination
          :page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-size-options="pageSizes"
          @update:page-size="handleSizeChange"
          @update:page="handleCurrentChange"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  title: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  showToolbar: { type: Boolean, default: true },
  showCreate: { type: Boolean, default: true },
  showExport: { type: Boolean, default: false },
  showRefresh: { type: Boolean, default: true },
  createText: { type: String, default: '新建' },
  showPagination: { type: Boolean, default: true },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
  pageSizes: { type: Array as () => number[], default: () => [10, 20, 50, 100] }
})

const emit = defineEmits(['create', 'export', 'refresh', 'size-change', 'current-change'])

const handleSizeChange = (size: number) => emit('size-change', size)
const handleCurrentChange = (page: number) => emit('current-change', page)
</script>
