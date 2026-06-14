<template>
  <div class="virtual-list-wrapper">
    <!-- 静态表头 -->
    <div
      class="virtual-list-header"
      :style="{ width: '100%' }"
    >
      <slot name="header">
        <table class="data-table w-full">
          <thead><tr><slot name="columns" /></tr></thead>
        </table>
      </slot>
    </div>

    <!-- 虚拟滚动列表 -->
    <RecycleScroller
      v-slot="{ item, index }"
      class="virtual-list-scroller"
      :items="displayItems"
      :item-size="itemSize"
      key-field="id"
      :buffer="buffer"
    >
      <div
        class="virtual-list-item"
        :style="itemStyle"
        @click="handleRowClick(item, index)"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
        />
      </div>
    </RecycleScroller>

    <!-- 加载更多 -->
    <div
      v-if="hasMore"
      class="virtual-list-loadmore"
    >
      <button
        v-if="!loading"
        class="btn btn-primary btn-sm"
        @click="handleLoadMore"
      >
        加载更多
      </button>
      <span v-else>加载中...</span>
    </div>

    <!-- 分页器（可选） -->
    <div
      v-if="showPagination"
      class="virtual-list-pagination"
    >
      <Pagination
        :total="total"
        :page="currentPage"
        :page-size="pageSize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array as any, default: () => [] },
  itemSize: { type: Number, default: 50 },
  buffer: { type: Number, default: 200 },
  headerHeight: { type: Number, default: 40 },
  headerRowStyle: { type: Object, default: () => ({}) },
  headerCellStyle: { type: Object, default: () => ({}) },
  itemStyle: { type: Object, default: () => ({}) },
  hasMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showPagination: { type: Boolean, default: false },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] }
})

const emit = defineEmits(['row-click', 'load-more', 'size-change', 'current-change'])

const displayItems = computed(() => props.items)

const handleRowClick = (item: any, index: any) => emit('row-click', item, index)
const handleLoadMore = () => emit('load-more')
</script>

<style>
.virtual-list-wrapper { width: 100%; }
.virtual-list-header { margin-bottom: 0; }
.virtual-list-scroller { height: 400px; overflow-y: auto; }
.virtual-list-item { cursor: pointer; }
.virtual-list-item:hover { background-color: #f5f7fa; }
.virtual-list-loadmore { text-align: center; padding: 20px 0; }
.virtual-list-pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
