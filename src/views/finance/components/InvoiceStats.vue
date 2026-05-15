<template>
  <StatsCards title="发票统计" :items="statItems" :loading="loading" layout="media" />
</template>

<script setup>
import { computed } from 'vue'
import { Document, Edit, CircleCheck, Clock } from '@element-plus/icons-vue'
import { StatsCards } from '@/components/common'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const statItems = computed(() => [
  { key: 'total', label: '发票总数', value: props.stats.total_count, format: 'number', icon: Document, tone: 'primary' },
  { key: 'draft', label: '待开具', value: props.stats.draft_count, format: 'number', icon: Edit, tone: 'warning' },
  { key: 'received', label: '已收款', value: props.stats.received_amount, format: 'currency', icon: CircleCheck, tone: 'success' },
  { key: 'pending', label: '待收款', value: props.stats.pending_amount, format: 'currency', icon: Clock, tone: 'danger' }
])
</script>
