<template>
  <div class="task-statistics">
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', {})"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><Tickets /></el-icon></div><div class="stat-info"><div class="stat-value">{{ taskStatistics.total_count || 0 }}</div><div class="stat-label">任务总数</div></div></div></el-card></el-col>
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', { status: 'pending' })"><div class="stat-content"><div class="stat-icon" style="background-color: #C0C4CC;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ taskStatusCount.pending || 0 }}</div><div class="stat-label">待开始任务</div></div></div></el-card></el-col>
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', { status: 'in_progress' })"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Loading /></el-icon></div><div class="stat-info"><div class="stat-value">{{ taskStatusCount.in_progress || 0 }}</div><div class="stat-label">进行中任务</div></div></div></el-card></el-col>
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', { status: 'completed' })"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ taskStatusCount.completed || 0 }}</div><div class="stat-label">已完成任务</div></div></div></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Tickets, Clock, Loading, CircleCheck } from '@element-plus/icons-vue'

const props = defineProps({ taskStatistics: { type: Object, default: () => ({}) }, taskStatusCount: { type: Object, default: () => ({}) } })
const emit = defineEmits(['navigate'])
</script>

<style scoped>
.stat-card { cursor: pointer; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
