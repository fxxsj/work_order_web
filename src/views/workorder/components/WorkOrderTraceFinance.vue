<template>
  <section class="card p-6">
    <div class="mb-4 text-lg font-bold">
      上下游关联
    </div>
    <div class="grid gap-4 lg:grid-cols-3">
      <div
        v-for="group in traceGroups"
        :key="group.title"
        class="rounded-lg border border-gray-100 p-4 dark:border-dark-700"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <span class="font-medium text-gray-900 dark:text-white">{{ group.title }}</span>
          <button
            v-if="group.route"
            type="button"
            class="btn btn-ghost btn-sm text-primary-600"
            @click="router.push(group.route)"
          >
            查看
          </button>
        </div>
        <div
          v-if="group.items.length"
          class="space-y-2"
        >
          <button
            v-for="item in group.items"
            :key="itemKey(item)"
            type="button"
            class="w-full rounded-md bg-gray-50 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:bg-dark-800 dark:hover:bg-dark-700"
            @click="openItem(group, item)"
          >
            <div class="font-medium text-gray-900 dark:text-white">
              {{ itemNumber(item) }}
            </div>
            <div class="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-dark-400">
              <span v-if="itemStatus(item)">{{ itemStatus(item) }}</span>
              <span v-if="itemAmount(item)">{{ itemAmount(item) }}</span>
              <span v-if="itemDate(item)">{{ itemDate(item) }}</span>
            </div>
          </button>
        </div>
        <div
          v-else
          class="py-4 text-sm text-gray-400"
        >
          暂无数据
        </div>
      </div>
    </div>

    <div class="mt-6 border-t border-gray-100 pt-5 dark:border-dark-700">
      <div class="mb-4 text-lg font-bold">
        财务闭环
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div
          v-for="item in financeItems"
          :key="item.label"
          class="rounded-lg bg-gray-50 p-4 dark:bg-dark-800"
        >
          <div class="text-xs text-gray-500 dark:text-dark-400">
            {{ item.label }}
          </div>
          <div class="mt-2 text-base font-semibold text-gray-900 dark:text-white">
            {{ item.value }}
          </div>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="router.push('/sales-orders')"
        >
          客户订单
        </button>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="router.push('/finance/invoices')"
        >
          发票
        </button>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="router.push('/finance/payments')"
        >
          收款
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatDate } from '@/utils/filter'

const props = defineProps<{
  workOrder: Record<string, any>
}>()

const router = useRouter()

const normalizeItems = (value: unknown): any[] => Array.isArray(value) ? value : []
const formatAmount = (value: any) => {
  if (value === undefined || value === null || value === '') return '¥0.00'
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const traceGroups = computed(() => [
  {
    title: '来源客户订单',
    route: '/sales-orders',
    detailPrefix: '/sales-orders',
    items: normalizeItems(props.workOrder?.sales_order_summaries)
  },
  {
    title: '关联质检单',
    route: '/inventory/quality',
    detailPrefix: '',
    items: normalizeItems(props.workOrder?.quality_inspection_summaries)
  },
  {
    title: '关联发票',
    route: '/finance/invoices',
    detailPrefix: '',
    items: normalizeItems(props.workOrder?.invoice_summaries)
  },
])

const financeItems = computed(() => [
  { label: '来源订单金额', value: formatAmount(props.workOrder?.sales_order_total_amount) },
  { label: '已回款', value: formatAmount(props.workOrder?.sales_order_paid_amount) },
  { label: '未回款', value: formatAmount(props.workOrder?.sales_order_unpaid_amount) },
  { label: '已结清订单', value: props.workOrder?.settled_sales_order_count ?? 0 },
  { label: '未结清订单', value: props.workOrder?.unsettled_sales_order_count ?? 0 },
  { label: '关联发票', value: props.workOrder?.invoice_count ?? 0 },
])

const itemKey = (item: any) => item?.id || item?.number || item?.order_number || item?.invoice_number || JSON.stringify(item)
const itemNumber = (item: any) => item?.number || item?.order_number || item?.invoice_number || item?.code || item?.name || '-'
const itemStatus = (item: any) => item?.status_display || item?.status || item?.payment_status_display || ''
const itemAmount = (item: any) => {
  const value = item?.total_amount ?? item?.amount
  return value === undefined || value === null ? '' : formatAmount(value)
}
const itemDate = (item: any) => formatDate(item?.date || item?.order_date || item?.created_at)

const openItem = (group: any, item: any) => {
  if (group.detailPrefix && item?.id) {
    router.push(`${group.detailPrefix}/${item.id}`)
    return
  }
  if (group.route) router.push(group.route)
}
</script>
