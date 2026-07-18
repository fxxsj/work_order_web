<template>
  <div class="card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="text-lg font-bold">采购信息</span>
      <BaseButton
        v-if="hasPurchasableMaterials"
        variant="primary"
        size="sm"
        icon="plus"
        title="按待采购物料创建采购单，创建后仍需提交、审核并下单"
        @click="emit('create-purchase')"
      >
        创建采购单
      </BaseButton>
    </div>
    <div
      v-if="materials?.length"
      class="mb-4 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-dark-300"
    >
      <span
        class="rounded-md bg-warning-50 px-2 py-1 text-warning-700"
      >待采购 {{ pendingMaterialCount }}</span>
      <span
        v-if="missingSupplierCount"
        class="rounded-md bg-danger-50 px-2 py-1 text-danger-700"
      >缺默认供应商 {{ missingSupplierCount }}</span>
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
        <template #cell-planning_status="{ row }">
          <span
            v-if="!row.planning_required"
            class="text-gray-400"
          >无需规划</span>
          <span
            v-else
            :class="row.planning_status === 'confirmed' ? 'text-success-600' : 'text-warning-600'"
          >
            {{ row.planning_status_display || row.planning_status }}
          </span>
        </template>
        <template #cell-actions="{ row }">
          <BaseButton
            v-if="row.planning_required"
            variant="ghost"
            size="sm"
            @click="emit('plan-material', row)"
          >
            {{ row.planning_status === 'confirmed' ? '查看计划' : '规划' }}
          </BaseButton>
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
import { BaseButton, Icon, StatusTag, EmptyState, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'

const props = defineProps({
  materials: { type: Array as any, default: () => [] },
  purchaseOrders: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['create-purchase', 'view-purchase', 'plan-material'])
const hasPurchasableMaterials = computed(() =>
  props.materials.some((m: any) => !m.purchase_status || m.purchase_status === 'pending') &&
  props.materials
    .filter((m: any) => m.planning_required)
    .every((m: any) => m.planning_status === 'confirmed')
)
const pendingMaterialCount = computed(() => props.materials.filter((m: any) => !m.purchase_status || m.purchase_status === 'pending').length)
const missingSupplierCount = computed(() =>
  props.materials.filter((m: any) => (!m.purchase_status || m.purchase_status === 'pending') && !m.default_supplier && !m.default_supplier_id && !m.supplier_name).length
)

const materialColumns: Column[] = [
  { key: 'material_name', label: '物料', minWidth: 176 },
  { key: 'material_usage', label: '用量', width: 120, align: 'center' },
  { key: 'planning_status', label: '物料规划', minWidth: 120 },
  { key: 'purchase_status', label: '采购状态', minWidth: 120 },
  { key: 'purchase_date', label: '采购日期', minWidth: 120, formatter: value => formatDate(value) },
  { key: 'received_date', label: '到货日期', minWidth: 120, formatter: value => formatDate(value) },
  { key: 'actions', label: '操作', width: 96, align: 'center' },
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
