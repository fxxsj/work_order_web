<template>
  <el-row :gutter="20" class="quality-stats">
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><DocumentChecked /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total_count || 0 }}</div><div class="stat-label">检验总数</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.pending_count || 0 }}</div><div class="stat-label">待检验</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.passed_count || 0 }}</div><div class="stat-label">合格</div></div></div></div></el-col>
    <el-col :xs="24" :sm="12" :md="6"><div class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #F56C6C;"><el-icon><CircleClose /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.failed_count || 0 }}</div><div class="stat-label">不合格</div></div></div></div></el-col>
  </el-row>
</template>

<script setup>
import { DocumentChecked, Clock, CircleCheck, CircleClose } from '@element-plus/icons-vue'

defineProps({ stats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
</script>

<style scoped>
.quality-stats { row-gap: var(--ui-section-gap); }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
