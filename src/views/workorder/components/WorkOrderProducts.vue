<template>
  <div v-if="hasProducts" class="mt-6">
    <div class="mb-3 font-bold">产品列表</div>
    <SummaryTable :columns="columns" :data="products" :row-key="rowKey">
      <template #cell-product_name="{ row }">
        {{ row.product_name }} ({{ row.product_code }})
      </template>
      <template #cell-quantity="{ row }">
        {{ row.quantity }} {{ row.unit }}
      </template>
      <template #cell-subtotal="{ row }">
        {{ row.product_detail ? `¥${(row.product_detail.unit_price * row.quantity).toFixed(2)}` : '-' }}
      </template>
    </SummaryTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({ products: { type: Array as any, default: () => [] } })
const hasProducts = computed(() => props.products?.length > 0)

const columns: Column[] = [
  { key: 'product_name', label: '产品名称', width: 208 },
  { key: 'specification', label: '规格', minWidth: 160, formatter: value => value || '-' },
  { key: 'imposition_quantity', label: '拼版', width: 96, align: 'center', formatter: value => `${value || 1}拼` },
  { key: 'quantity', label: '数量', width: 112, align: 'right' },
  { key: 'subtotal', label: '小计', width: 144, align: 'right' },
]

const rowKey = (row: any, index: number) => row.id || row.product_code || index
</script>
