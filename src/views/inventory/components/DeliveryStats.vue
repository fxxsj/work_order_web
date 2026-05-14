<template>
  <el-row :gutter="20" class="delivery-stats">
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><List /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total || 0 }}</div><div class="stat-label">总发货单</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.pending || 0 }}</div><div class="stat-label">待发货</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Van /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.in_transit || 0 }}</div><div class="stat-label">运输中</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.completed || 0 }}</div><div class="stat-label">已完成</div></div></div></div></el-col>
  </el-row>
</template>

<script setup>
import { List, Clock, Van, CircleCheck } from '@element-plus/icons-vue'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
</script>

<style scoped>
.delivery-stats { row-gap: var(--ui-section-gap); }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
