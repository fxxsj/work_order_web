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
  { key: 'total', label: '总收款金额', value: props.stats.total_amount, format: 'currency', iconName: 'dollar', tone: 'primary' },
  { key: 'applied', label: '已核销金额', value: props.stats.applied_amount, format: 'currency', iconName: 'checkCircle', tone: 'success' },
  { key: 'unapplied', label: '未核销金额', value: props.stats.unapplied_amount, format: 'currency', iconName: 'clock', tone: 'warning' }
])
</script>
