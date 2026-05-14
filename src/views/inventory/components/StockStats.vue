<template>
  <el-row :gutter="20" class="stock-stats">
    <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Goods /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total_quantity || 0 }}</div><div class="stat-label">总库存数</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><Box /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total_products || 0 }}</div><div class="stat-label">产品种类</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Warning /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.low_stock_count || 0 }}</div><div class="stat-label">低库存</div></div></div></div></el-col>
  </el-row>
</template>

<script setup>
import { Goods, Box, Warning } from '@element-plus/icons-vue'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
</script>

<style scoped>
.stock-stats { row-gap: var(--ui-section-gap); }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
