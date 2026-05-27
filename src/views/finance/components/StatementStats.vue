<template>
  <StatsCards
    title="对账单统计"
    :items="statItems"
    :loading="loading"
    :span="8"
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
  { key: 'total', label: '对账单总数', value: props.stats.total_count, format: 'number', iconName: 'document', tone: 'primary' },
  { key: 'debit', label: '本期借方', value: props.stats.total_debit, format: 'currency', iconName: 'dollar', tone: 'primary' },
  { key: 'credit', label: '本期贷方', value: props.stats.total_credit, format: 'currency', iconName: 'checkCircle', tone: 'success' },
  { key: 'closing', label: '期末余额', value: props.stats.closing_balance, format: 'currency', iconName: 'clock', tone: 'warning' }
])
</script>
