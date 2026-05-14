<template>
  <div class="stats-cards">
    <el-row :gutter="gutter">
      <el-col
        v-for="(item, index) in items"
        :key="`stat-card-${index}`"
        :span="span"
      >
        <el-card :class="['stat-card', item.type]">
          <div class="stat-item">
            <div class="stat-label">
              <el-icon v-if="item.icon"><component :is="item.icon" /></el-icon>
              {{ item.label }}
            </div>
            <div class="stat-value">
              <template v-if="item.prefix">
                {{ item.prefix }}
              </template>
              {{ formatValue(item.value, item.format) }}
              <template v-if="item.suffix">
                {{ item.suffix }}
              </template>
            </div>
            <div v-if="item.subtext" class="stat-subtext">
              {{ item.subtext }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
  span: { type: Number, default: 6 },
  gutter: { type: Number, default: 20 }
})

const formatValue = (value, format) => {
  if (format === 'number') {
    return Number(value).toLocaleString()
  }
  if (format === 'currency') {
    return `¥${Number(value).toFixed(2)}`
  }
  if (format === 'percent') {
    return `${(value * 100).toFixed(2)}%`
  }
  return value
}
</script>

<style scoped>
.stats-cards {
  margin-bottom: 20px;
}
.stat-card {
  margin-bottom: 20px;
}
.stat-item {
  text-align: center;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
.stat-subtext {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
