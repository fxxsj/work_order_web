<template>
  <StatsCards title="对账单统计" :items="statItems" :loading="loading" :span="8" layout="media" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatsCards } from '@/components/common'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const statItems = computed(() => [
  { key: 'total', label: '对账单总数', value: props.stats.total_count, format: 'number', iconName: 'document', tone: 'primary' },
  { key: 'paid', label: '已付款', value: props.stats.paid_amount, format: 'currency', iconName: 'checkCircle', tone: 'success' },
  { key: 'pending', label: '待付款', value: props.stats.pending_amount, format: 'currency', iconName: 'clock', tone: 'warning' }
])
</script>
