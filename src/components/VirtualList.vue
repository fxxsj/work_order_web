<template>
  <div class="virtual-list-wrapper">
    <!-- 静态表格（仅用于表头） -->
    <div class="virtual-list-header" :style="{ width: '100%' }">
      <el-table
        :data="[]"
        :height="headerHeight"
        border
        :header-row-style="headerRowStyle"
        :header-cell-style="headerCellStyle"
      >
        <slot name="columns"></slot>
      </el-table>
    </div>

    <!-- 虚拟滚动列表 -->
    <RecycleScroller
      class="virtual-list-scroller"
      :items="displayItems"
      :item-size="itemSize"
      key-field="id"
      :buffer="buffer"
      #default="{ item, index }"
    >
      <div
        class="virtual-list-item"
        :style="itemStyle"
        @click="handleRowClick(item, index)"
      >
        <slot name="item" :item="item" :index="index"></slot>
      </div>
    </RecycleScroller>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="virtual-list-loadmore">
      <el-button
        v-if="!loading"
        type="primary"
        plain
        size="small"
        @click="handleLoadMore"
      >
        加载更多
      </el-button>
      <span v-else>加载中...</span>
    </div>

    <!-- 分页器（可选） -->
    <div v-if="showPagination" class="virtual-list-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
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

const handleRowClick = (item, index) => emit('row-click', item, index)
const handleLoadMore = () => emit('load-more')
const handleSizeChange = (size) => emit('size-change', size)
const handleCurrentChange = (page) => emit('current-change', page)
</script>

<style scoped>
.virtual-list-wrapper {
  width: 100%;
}
.virtual-list-header {
  margin-bottom: 0;
}
.virtual-list-scroller {
  height: 400px;
  overflow-y: auto;
}
.virtual-list-item {
  cursor: pointer;
}
.virtual-list-item:hover {
  background-color: #f5f7fa;
}
.virtual-list-loadmore {
  text-align: center;
  padding: 20px 0;
}
.virtual-list-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
