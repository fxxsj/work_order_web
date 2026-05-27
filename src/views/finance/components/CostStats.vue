<template>
  <StatsCards
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
  { key: 'orders', label: '订单数量', value: props.stats.total_orders, format: 'number', iconName: 'list', tone: 'primary' },
  { key: 'total', label: '总成本', value: props.stats.total_cost, format: 'currency', iconName: 'dollar', tone: 'primary' },
  { key: 'material', label: '材料成本', value: props.stats.total_material, format: 'currency', iconName: 'cube', tone: 'success' },
  { key: 'labor', label: '人工成本', value: props.stats.total_labor, format: 'currency', iconName: 'user', tone: 'warning' }
])
</script>
