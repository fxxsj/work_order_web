<template>
  <div class="skeleton-loader">
    <!-- 表格骨架屏 -->
    <div v-if="type === 'table'" class="skeleton-table">
      <div v-for="i in rows" :key="i" class="skeleton-row">
        <div
          v-for="j in columns"
          :key="j"
          class="skeleton-cell"
          :style="{ width: getColumnWidth(j) }"
        ></div>
      </div>
    </div>

    <!-- 卡片骨架屏 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div v-for="i in rows" :key="i" class="skeleton-card-item">
        <div class="skeleton-card-header"></div>
        <div class="skeleton-card-body">
          <div class="skeleton-line" style="width: 60%"></div>
          <div class="skeleton-line" style="width: 80%"></div>
          <div class="skeleton-line" style="width: 40%"></div>
        </div>
      </div>
    </div>

    <!-- 列表骨架屏 -->
    <div v-else class="skeleton-list">
      <div v-for="i in rows" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width: 70%"></div>
          <div class="skeleton-line" style="width: 50%"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'list',
    validator: value => ['table', 'card', 'list'].includes(value)
  },
  rows: { type: Number, default: 5 },
  columns: { type: Number, default: 4 },
  columnWidths: { type: Array, default: () => [] }
})

const getColumnWidth = (index) => {
  if (props.columnWidths && props.columnWidths[index - 1]) {
    return props.columnWidths[index - 1]
  }
  return `${100 / props.columns}%`
}
</script>

<style scoped>
.skeleton-loader {
  padding: 20px;
}
.skeleton-row,
.skeleton-card-item,
.skeleton-list-item {
  display: flex;
  margin-bottom: 16px;
  animation: skeleton-loading 1.5s infinite;
}
.skeleton-cell,
.skeleton-card-header,
.skeleton-line,
.skeleton-avatar {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}
.skeleton-cell {
  height: 20px;
  margin-right: 16px;
}
.skeleton-card-header {
  height: 120px;
  width: 100%;
  margin-bottom: 16px;
}
.skeleton-line {
  height: 16px;
  margin-bottom: 8px;
}
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 16px;
}
.skeleton-content {
  flex: 1;
}
@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
