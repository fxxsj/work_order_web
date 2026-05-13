<template>
  <div class="work-order-statistics">
    <el-row :gutter="20" class="stat-cards">
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', {})"><div class="stat-content"><div class="stat-icon" style="background-color: #409EFF;"><el-icon><Document /></el-icon></div><div class="stat-info"><div class="stat-value">{{ statistics.total_count || 0 }}</div><div class="stat-label">施工单总数</div></div></div></el-card></el-col>
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', { status: 'completed' })"><div class="stat-content"><div class="stat-icon" style="background-color: #67C23A;"><el-icon><CircleCheck /></el-icon></div><div class="stat-info"><div class="stat-value">{{ getStatusCount('completed') }}</div><div class="stat-label">已完成</div></div></div></el-card></el-col>
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', { status: 'in_progress' })"><div class="stat-content"><div class="stat-icon" style="background-color: #E6A23C;"><el-icon><Loading /></el-icon></div><div class="stat-info"><div class="stat-value">{{ getStatusCount('in_progress') }}</div><div class="stat-label">进行中</div></div></div></el-card></el-col>
      <el-col :xs="12" :sm="6" :md="6"><el-card class="stat-card" @click="emit('navigate', { status: 'pending' })"><div class="stat-content"><div class="stat-icon" style="background-color: #909399;"><el-icon><Clock /></el-icon></div><div class="stat-info"><div class="stat-value">{{ getStatusCount('pending') }}</div><div class="stat-label">待开始</div></div></div></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Document, CircleCheck, Loading, Clock } from '@element-plus/icons-vue'

defineProps({ statistics: { type: Object, default: () => ({}) } })
const emit = defineEmits(['navigate'])
const getStatusCount = (status) => 0 // Placeholder
</script>

<style scoped>
.stat-card { cursor: pointer; }
.stat-content { display: flex; align-items: center; gap: 12px; }
.stat-icon { width: 48px; height: 48px; border-radius: 12px; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: bold; }
.stat-label { font-size: 12px; color: #909399; }
</style>
