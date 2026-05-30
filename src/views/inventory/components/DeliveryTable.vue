<template>
  <DataTable
    :columns="columns"
    :data="data"
    :loading="loading"
    row-key="id"
  >
    <template #cell-order_number="{ row }">
      {{ row.order_number }}
    </template>
    <template #cell-customer_name="{ row }">
      {{ row.customer_name }}
    </template>
    <template #cell-sales_order_number="{ row }">
      {{ row.sales_order_number }}
    </template>
    <template #cell-receiver_name="{ row }">
      {{ row.receiver_name }}
    </template>
    <template #cell-receiver_phone="{ row }">
      {{ row.receiver_phone }}
    </template>
    <template #cell-delivery_address="{ row }">
      {{ row.delivery_address }}
    </template>
    <template #cell-logistics_company="{ row }">
      {{ row.logistics_company }}
    </template>
    <template #cell-tracking_number="{ row }">
      <a
        v-if="row.tracking_number"
        :href="getTrackingUrl(row)"
        target="_blank"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >{{ row.tracking_number }}</a>
      <span v-else>-</span>
    </template>
    <template #cell-delivery_date="{ row }">
      {{ row.delivery_date }}
    </template>
    <template #cell-status="{ row }">
      <StatusTag
        :status="row.status"
        category="delivery"
        :label="row.status_display"
      />
    </template>
    <template #cell-actions="{ row }">
      <RowActions
        :actions="getRowActions(row)"
        @action="(action) => handleRowAction(action, row)"
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import { StatusTag, DataTable, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'

defineProps({ data: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['view', 'edit', 'ship'])

const columns: Column[] = [
  { key: 'order_number', label: '送货单号', width: 160 },
  { key: 'customer_name', label: '客户名称', width: 160 },
  { key: 'sales_order_number', label: '客户订单', width: 160 },
  { key: 'receiver_name', label: '收货人', width: 112 },
  { key: 'receiver_phone', label: '联系电话', width: 128 },
  { key: 'delivery_address', label: '送货地址' },
  { key: 'logistics_company', label: '物流公司', width: 128 },
  { key: 'tracking_number', label: '物流单号', width: 160 },
  { key: 'delivery_date', label: '发货日期', width: 128 },
  { key: 'status', label: '状态', width: 112 },
  { key: 'actions', label: '操作', width: 160, fixed: 'right' },
]

const getRowActions = (row: any): RowAction[] => [
  { key: 'view', label: '查看', icon: 'eye', tone: 'primary' },
  { key: 'edit', label: '编辑', icon: 'edit', tone: 'primary', visible: row.status === 'pending' },
  { key: 'ship', label: '发货', icon: 'truck', tone: 'success', visible: row.status === 'pending' },
]

const handleRowAction = (action: RowAction, row: any) => {
  if (action.key === 'view') emit('view', row)
  else if (action.key === 'edit') emit('edit', row)
  else if (action.key === 'ship') emit('ship', row)
}

const getTrackingUrl = (row: any) => `https://www.baidu.com/s?wd=${row.tracking_number || ''}`
</script>
