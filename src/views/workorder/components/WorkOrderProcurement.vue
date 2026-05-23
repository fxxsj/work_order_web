<template>
  <div class="mt-6">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3 font-bold">
      <span>采购信息</span>
      <button v-if="hasPendingMaterials" class="btn btn-primary btn-sm" @click="emit('create-purchase')"><Icon name="plus" class="h-3 w-3" /> 创建采购单</button>
    </div>

    <div v-if="materials?.length" class="mb-6">
      <div class="mb-2 text-sm font-medium text-gray-500 dark:text-dark-400">物料采购状态</div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">物料</th>
              <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">用量</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">采购状态</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">采购日期</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">到货日期</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in materials" :key="row.id || row.material_code" class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
              <td class="px-3 py-2">{{ row.material_name }} ({{ row.material_code }})</td>
              <td class="px-3 py-2 text-center">{{ row.material_usage }}</td>
              <td class="px-3 py-2"><StatusTag :status="row.purchase_status" category="materialPurchase" size="small" /></td>
              <td class="px-3 py-2">{{ formatDate(row.purchase_date) }}</td>
              <td class="px-3 py-2">{{ formatDate(row.received_date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="purchaseOrders?.length" class="mb-6">
      <div class="mb-2 text-sm font-medium text-gray-500 dark:text-dark-400">关联采购单</div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">采购单号</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">供应商</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">状态</th>
              <th class="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">金额</th>
              <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">明细数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in purchaseOrders" :key="row.id" class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
              <td class="px-3 py-2">
                <span class="cursor-pointer text-primary-600 hover:underline" @click="emit('view-purchase', row.id)">
                  {{ row.order_number || row.number }}<Icon name="arrowRight" class="ml-1 inline h-3 w-3" />
                </span>
              </td>
              <td class="px-3 py-2">{{ row.supplier_name }}</td>
              <td class="px-3 py-2"><StatusTag :status="row.status" category="purchaseOrder" size="small" /></td>
              <td class="px-3 py-2 text-right">&yen;{{ Number(row.total_amount || 0).toLocaleString() }}</td>
              <td class="px-3 py-2 text-center">{{ row.items_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EmptyState v-if="!materials?.length && !purchaseOrders?.length" title="暂无采购信息" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag, EmptyState } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({
  materials: { type: Array as any, default: () => [] },
  purchaseOrders: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['create-purchase', 'view-purchase'])
const hasPendingMaterials = computed(() => props.materials.some((m: any) => m.purchase_status === 'pending'))
</script>
