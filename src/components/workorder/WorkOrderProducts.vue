<template>
  <div class="card p-6">
    <div class="mb-4 text-lg font-bold">
      产品清单
    </div>
    <SummaryTable
      v-if="hasProducts"
      :columns="columns"
      :data="products"
      :row-key="rowKey"
    >
      <template #cell-product_name="{ row }">
        {{ row.product_name }} ({{ row.product_code }})
      </template>
      <template #cell-quantity="{ row }">
        {{ row.quantity }} {{ row.unit }}
      </template>
      <template #cell-source="{ row }">
        <span>{{ row.source_type_display || row.source_type || '-' }}</span>
        <span
          v-if="row.source_sales_order_number"
          class="ml-1 text-gray-400"
        >{{ row.source_sales_order_number }}</span>
      </template>
      <template #cell-subtotal="{ row }">
        {{ formatSubtotal(row) }}
      </template>
    </SummaryTable>
    <EmptyState
      v-else
      title="暂无产品"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EmptyState, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({ products: { type: Array as any, default: () => [] } })
const hasProducts = computed(() => props.products?.length > 0)

const columns: Column[] = [
  { key: 'product_name', label: '产品名称', width: 208 },
  { key: 'specification', label: '规格', minWidth: 160, formatter: value => value || '-' },
  { key: 'imposition_quantity', label: '拼版', width: 96, align: 'center', formatter: value => `${value || 1}拼` },
  { key: 'quantity', label: '数量', width: 112, align: 'right' },
  { key: 'source', label: '来源', minWidth: 144 },
  { key: 'subtotal', label: '小计', width: 144, align: 'right' },
]

const rowKey = (row: any, index: number) => row.id || row.product_code || index
const formatSubtotal = (row: any) => {
  const unitPrice = row.product_detail?.unit_price
  if (unitPrice === undefined || unitPrice === null || row.quantity === undefined || row.quantity === null) return '-'
  return `¥${(Number(unitPrice) * Number(row.quantity)).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
</script>
