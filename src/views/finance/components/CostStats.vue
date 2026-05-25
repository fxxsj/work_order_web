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
  { key: 'material', label: '平均材料成本', value: props.stats.avg_material_cost, format: 'currency', iconName: 'cube', tone: 'success' },
  { key: 'labor', label: '平均人工成本', value: props.stats.avg_labor_cost, format: 'currency', iconName: 'user', tone: 'warning' }
])
</script>
