<template>
  <div class="card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="text-lg font-bold">采购信息</span>
      <button
        v-if="hasPendingMaterials"
        class="btn btn-primary btn-sm"
        @click="emit('create-purchase')"
      >
        <Icon
          name="plus"
          class="h-3 w-3"
        /> 创建采购单
      </button>
    </div>

    <div
      v-if="materials?.length"
      class="mb-6"
    >
      <div class="mb-2 text-sm font-medium text-gray-500 dark:text-dark-400">
        物料采购状态
      </div>
      <SummaryTable
        :columns="materialColumns"
        :data="materials"
        :row-key="materialRowKey"
      >
        <template #cell-material_name="{ row }">
          {{ row.material_name }} ({{ row.material_code }})
        </template>
        <template #cell-purchase_status="{ row }">
          <StatusTag
            :status="row.purchase_status"
            category="materialPurchase"
            size="small"
          />
        </template>
      </SummaryTable>
    </div>

    <div
      v-if="purchaseOrders?.length"
      class="mb-6"
    >
      <div class="mb-2 text-sm font-medium text-gray-500 dark:text-dark-400">
        关联采购单
      </div>
      <SummaryTable
        :columns="purchaseColumns"
        :data="purchaseOrders"
        row-key="id"
      >
        <template #cell-order_number="{ row }">
          <span
            class="cursor-pointer text-primary-600 hover:underline"
            @click="emit('view-purchase', row.id)"
          >
            {{ row.order_number || row.number }}<Icon
              name="arrowRight"
              class="ml-1 inline h-3 w-3"
            />
          </span>
        </template>
        <template #cell-status="{ row }">
          <StatusTag
            :status="row.status"
            category="purchaseOrder"
            size="small"
          />
        </template>
      </SummaryTable>
    </div>

    <EmptyState
      v-if="!materials?.length && !purchaseOrders?.length"
      title="暂无采购信息"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag, EmptyState, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'

const props = defineProps({
  materials: { type: Array as any, default: () => [] },
  purchaseOrders: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['create-purchase', 'view-purchase'])
const hasPendingMaterials = computed(() => props.materials.some((m: any) => !m.purchase_status || m.purchase_status === 'pending'))

const materialColumns: Column[] = [
  { key: 'material_name', label: '物料', minWidth: 176 },
  { key: 'material_usage', label: '用量', width: 120, align: 'center' },
  { key: 'purchase_status', label: '采购状态', minWidth: 120 },
  { key: 'purchase_date', label: '采购日期', minWidth: 120, formatter: value => formatDate(value) },
  { key: 'received_date', label: '到货日期', minWidth: 120, formatter: value => formatDate(value) },
]

const purchaseColumns: Column[] = [
  { key: 'order_number', label: '采购单号', minWidth: 160 },
  { key: 'supplier_name', label: '供应商', minWidth: 160 },
  { key: 'status', label: '状态', minWidth: 120 },
  { key: 'total_amount', label: '金额', width: 120, align: 'right', formatter: value => `¥${Number(value || 0).toLocaleString()}` },
  { key: 'items_count', label: '明细数', width: 96, align: 'center' },
]

const materialRowKey = (row: any, index: number) => row.id || row.material_code || index
</script>
