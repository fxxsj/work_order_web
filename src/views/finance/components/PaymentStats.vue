<template>
  <el-row :gutter="20" class="payment-stats">
    <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Money /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.total_amount) }}</div><div class="stat-label">总收款金额</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.applied_amount) }}</div><div class="stat-label">已核销金额</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="8"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">¥{{ formatAmount(stats.unapplied_amount) }}</div><div class="stat-label">未核销金额</div></div></div></div></el-col>
  </el-row>
</template>

<script setup>
import { Money, CircleCheck, Clock } from '@element-plus/icons-vue'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
const formatAmount = (v) => v ? parseFloat(v).toFixed(2) : '0.00'
</script>

<style scoped>
.payment-stats { row-gap: var(--ui-section-gap); }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
