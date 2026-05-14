<template>
  <div class="virtual-table-container">
    <div class="virtual-table-header">
      <el-table
        :data="displayData"
        border
        style="width: 100%"
        :header-row-class-name="headerRowClassName"
      >
        <slot>
          <slot name="columns"></slot>
        </slot>
      </el-table>
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
        <el-table
          :data="[item]"
          border
          style="width: 100%"
          :row-class-name="rowClassName"
          :show-header="false"
        >
          <slot>
            <slot name="columns" :item="item" :index="index"></slot>
          </slot>
        </el-table>
      </div>
    </RecycleScroller>

    <div v-else class="virtual-table-empty">
      <slot name="empty">
        <el-empty description="暂无数据" />
      </slot>
    </div>

    <div v-if="showPagination" class="virtual-table-pagination">
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
  data: { type: Array, default: () => [] },
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

const handleSizeChange = (size) => emit('size-change', size)
const handleCurrentChange = (page) => emit('current-change', page)
</script>

<style scoped>
.virtual-table-container {
  width: 100%;
}
.virtual-table-header {
  margin-bottom: 0;
}
.virtual-table-body {
  height: 400px;
  overflow-y: auto;
}
.virtual-table-row {
  margin-bottom: 0;
}
.virtual-table-empty {
  padding: 40px 0;
  text-align: center;
}
.virtual-table-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
