<template>
  <el-row :gutter="20" class="cost-stats">
    <el-col :span="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><List /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total_orders || 0 }}</div><div class="stat-label">订单数量</div></div></div></div></el-col>
    <el-col :span="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><Goods /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.avg_material_cost) }}</div><div class="stat-label">平均材料成本</div></div></div></div></el-col>
    <el-col :span="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><User /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.avg_labor_cost) }}</div><div class="stat-label">平均人工成本</div></div></div></div></el-col>
  </el-row>
</template>

<script setup>
import { List, Goods, User } from '@element-plus/icons-vue'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
const formatAmount = (v) => v ? parseFloat(v).toFixed(2) : '0.00'
</script>

<style scoped>
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
