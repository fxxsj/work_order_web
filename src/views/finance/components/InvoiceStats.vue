<template>
  <StatsCards
    title="发票统计"
    :items="statItems"
    :loading="loading"
    layout="media"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatsCards } from '@/components/common'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const statItems = computed(() => [
  { key: 'total', label: '发票总数', value: props.stats.total_count, format: 'number', iconName: 'document', tone: 'primary' },
  { key: 'draft', label: '待开具', value: props.stats.draft_count, format: 'number', iconName: 'edit', tone: 'warning' },
  { key: 'totalAmount', label: '开票金额', value: props.stats.total_amount, format: 'currency', iconName: 'checkCircle', tone: 'success' },
  { key: 'pending', label: '待收款', value: props.stats.pending_amount, format: 'currency', iconName: 'clock', tone: 'danger' }
])
</script>
