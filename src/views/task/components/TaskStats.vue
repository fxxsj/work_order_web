<template>
  <StatsCards :items="statItems" layout="media" />
</template>

<script setup>
import { computed } from 'vue'
import { Document, Clock, Loading, CircleCheck } from '@element-plus/icons-vue'
import { StatsCards } from '@/components/common'

const props = defineProps({
  stats: { type: Object, default: () => ({}) }
})

const statItems = computed(() => [
  { key: 'total', label: '总任务数', value: props.stats.total, format: 'number', icon: Document, tone: 'primary' },
  { key: 'pending', label: '待开始', value: props.stats.pending, format: 'number', icon: Clock, tone: 'info' },
  { key: 'in-progress', label: '进行中', value: props.stats.in_progress, format: 'number', icon: Loading, tone: 'warning' },
  { key: 'completed', label: '已完成', value: props.stats.completed, format: 'number', icon: CircleCheck, tone: 'success' }
])
</script>
