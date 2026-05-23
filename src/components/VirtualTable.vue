<template>
  <div class="virtual-table-container">
    <div class="virtual-table-header">
      <table class="data-table w-full">
        <thead><tr><slot name="columns"></slot></tr></thead>
      </table>
    </div>

    <RecycleScroller
      v-if="displayData.length > 0"
      class="virtual-table-body"
      :items="displayData"
      :item-size="itemSize"
      key-field="id"
      :buffer="buffer"
      #default="{ item, index }"
    >
      <div :class="['virtual-table-row', rowClassName]">
        <slot name="row" :item="item" :index="index">
          <slot name="columns" :item="item" :index="index"></slot>
        </slot>
      </div>
    </RecycleScroller>

    <div v-else class="virtual-table-empty">
      <slot name="empty">
        <EmptyState title="暂无数据" />
      </slot>
    </div>

    <div v-if="showPagination" class="virtual-table-pagination">
      <Pagination :total="total" :page="currentPage" :pageSize="pageSize" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array as any, default: () => [] },
  itemSize: { type: Number, default: 50 },
  buffer: { type: Number, default: 200 },
  headerRowClassName: { type: String, default: '' },
  rowClassName: { type: String, default: '' },
  showPagination: { type: Boolean, default: true },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, default: 0 },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] }
})

const emit = defineEmits(['size-change', 'current-change'])

const displayData = computed(() => props.data)

const handleSizeChange = (size: any) => emit('size-change', size)
const handleCurrentChange = (page: any) => emit('current-change', page)
</script>

<style>
.virtual-table-container { width: 100%; }
.virtual-table-header { margin-bottom: 0; }
.virtual-table-body { height: 400px; overflow-y: auto; }
.virtual-table-row { margin-bottom: 0; }
.virtual-table-empty { padding: 40px 0; text-align: center; }
.virtual-table-pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>
