<template>
  <el-card>
    <template #header><span>对账单统计</span></template>
    <el-row :gutter="20" class="statement-stats">
      <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Document /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total_count || 0 }}</div><div class="stat-label">对账单总数</div></div></div></div></el-col>
      <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.paid_amount) }}</div><div class="stat-label">已付款</div></div></div></div></el-col>
      <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.pending_amount) }}</div><div class="stat-label">待付款</div></div></div></div></el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { Document, CircleCheck, Clock } from '@element-plus/icons-vue'

defineProps({ stats: { type: Object, default: () => ({}) } })
const formatAmount = (v) => v ? parseFloat(v).toFixed(2) : '0.00'
</script>

<style scoped>
.statement-stats { row-gap: var(--ui-section-gap); }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
