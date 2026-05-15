<template>
  <StatsCards title="对账单统计" :items="statItems" :loading="loading" :span="8" layout="media" />
</template>

<script setup>
import { computed } from 'vue'
import { Document, CircleCheck, Clock } from '@element-plus/icons-vue'
import { StatsCards } from '@/components/common'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const statItems = computed(() => [
  { key: 'total', label: '对账单总数', value: props.stats.total_count, format: 'number', icon: Document, tone: 'primary' },
  { key: 'paid', label: '已付款', value: props.stats.paid_amount, format: 'currency', icon: CircleCheck, tone: 'success' },
  { key: 'pending', label: '待付款', value: props.stats.pending_amount, format: 'currency', icon: Clock, tone: 'warning' }
])
</script>
