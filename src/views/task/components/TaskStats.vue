<template>
  <el-row :gutter="20" class="task-stats">
    <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Document /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.total || 0 }}</div><div class="stat-label">总任务数</div></div></div></el-card></el-col>
    <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.pending || 0 }}</div><div class="stat-label">待开始</div></div></div></el-card></el-col>
    <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Loading /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.in_progress || 0 }}</div><div class="stat-label">进行中</div></div></div></el-card></el-col>
    <el-col :span="6"><el-card class="stat-card"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ stats.completed || 0 }}</div><div class="stat-label">已完成</div></div></div></el-card></el-col>
  </el-row>
</template>

<script setup>
import { Document, Clock, Loading, CircleCheck } from '@element-plus/icons-vue'
defineProps({ stats: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.task-stats { margin-bottom: 20px; }
.stat-card { border-radius: 10px; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
