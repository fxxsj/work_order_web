<template>
  <div class="crud-page-layout">
    <!-- 页面头部 -->
    <div v-if="title || $slots.header" class="crud-header">
      <div class="crud-header-left">
        <h2 v-if="title" class="crud-title">
          {{ title }}
        </h2>
        <slot name="header"></slot>
      </div>
      <div v-if="$slots.actions" class="crud-header-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- 筛选/搜索区域 -->
    <div v-if="$slots.filter || $slots.search" class="crud-filter-section">
      <slot name="filter"></slot>
      <slot name="search"></slot>
    </div>

    <!-- 工具栏区域 -->
    <div v-if="showToolbar || $slots.toolbar" class="crud-toolbar">
      <slot name="toolbar">
        <el-button
          v-if="showCreate"
          type="primary"
          :icon="Plus"
          @click="$emit('create')"
        >
          {{ createText }}
        </el-button>
        <el-button
          v-if="showExport"
          type="success"
          :icon="Download"
          @click="$emit('export')"
        >
          导出
        </el-button>
        <el-button v-if="showRefresh" :icon="Refresh" @click="$emit('refresh')">
          刷新
        </el-button>
      </slot>
    </div>

    <!-- 内容区域 -->
    <div v-loading="loading" class="crud-content">
      <slot></slot>
    </div>

    <!-- 分页区域 -->
    <div v-if="showPagination" class="crud-pagination">
      <slot name="pagination">
        <el-pagination
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="pageSizes"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { Plus, Download, Refresh } from '@element-plus/icons-vue'

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
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] }
})

const emit = defineEmits(['create', 'export', 'refresh', 'size-change', 'current-change'])

const handleSizeChange = (size) => emit('size-change', size)
const handleCurrentChange = (page) => emit('current-change', page)
</script>

<style scoped>
.crud-page-layout {
  padding: 20px;
}
.crud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.crud-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}
.crud-filter-section {
  margin-bottom: 20px;
}
.crud-toolbar {
  margin-bottom: 20px;
}
.crud-content {
  margin-bottom: 20px;
}
.crud-pagination {
  display: flex;
  justify-content: flex-end;
}
</style>
