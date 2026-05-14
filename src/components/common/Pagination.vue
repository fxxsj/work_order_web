<template>
  <div class="pagination-wrapper">
    <el-pagination
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      :layout="layout"
      :background="background"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, required: true },
  pageSizes: { type: Array, default: () => [10, 20, 50, 100] },
  layout: { type: String, default: 'total, sizes, prev, pager, next, jumper' },
  background: { type: Boolean, default: true }
})

const emit = defineEmits(['current-change', 'size-change'])

const handleCurrentChange = (page) => emit('current-change', page)
const handleSizeChange = (size) => emit('size-change', size)
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding: 10px 0;
}
</style>
