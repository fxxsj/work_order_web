<template>
  <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900 dark:text-white">客户统计（Top 10）</span>
      </div>
      <div class="card-body">
        <SummaryTable :columns="columns" :data="businessAnalysis?.customer_statistics || []" row-key="customer">
          <template #cell-completion_rate="{ row }">
            <ProgressBar :percentage="row.completion_rate || 0" :color="getProgressColor(row.completion_rate)" :stroke-width="8" />
          </template>
        </SummaryTable>
      </div>
    </div>
    <div class="card">
      <div class="card-header flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900 dark:text-white">产品统计（Top 10）</span>
      </div>
      <div class="card-body">
        <SummaryTable :columns="productColumns" :data="businessAnalysis?.product_statistics || []" row-key="product">
          <template #cell-completion_rate="{ row }">
            <ProgressBar :percentage="row.completion_rate || 0" :color="getProgressColor(row.completion_rate)" :stroke-width="8" />
          </template>
        </SummaryTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

defineProps({ businessAnalysis: { type: Object, default: () => ({}) } })
const getProgressColor = (rate: any) => rate >= 80 ? '#67C23A' : rate >= 50 ? '#409EFF' : '#E6A23C'

const columns: Column[] = [
  { key: 'customer', label: '客户', class: 'min-w-40' },
  { key: 'total', label: '施工单数', align: 'right', class: 'w-28' },
  { key: 'completed', label: '已完成', align: 'right', class: 'w-28' },
  { key: 'completion_rate', label: '完成率', align: 'right', class: 'w-32' },
]

const productColumns: Column[] = [
  { key: 'product', label: '产品', class: 'min-w-40' },
  { key: 'total', label: '施工单数', align: 'right', class: 'w-28' },
  { key: 'completed', label: '已完成', align: 'right', class: 'w-28' },
  { key: 'completion_rate', label: '完成率', align: 'right', class: 'w-32' },
]
</script>
