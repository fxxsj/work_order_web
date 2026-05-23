<template>
  <div class="overflow-x-auto">
    <table class="data-table w-full">
      <thead>
        <tr>
          <th class="w-40">发货单号</th>
          <th class="w-40">客户名称</th>
          <th class="w-40">销售订单</th>
          <th class="w-28">收货人</th>
          <th class="w-32">联系电话</th>
          <th class="w-52">送货地址</th>
          <th class="w-32">物流公司</th>
          <th class="w-40">物流单号</th>
          <th class="w-32">发货日期</th>
          <th class="w-28">状态</th>
          <th class="w-64">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in data" :key="row.id">
          <td>{{ row.order_number }}</td>
          <td>{{ row.customer_name }}</td>
          <td>{{ row.sales_order_number }}</td>
          <td>{{ row.receiver_name }}</td>
          <td>{{ row.receiver_phone }}</td>
          <td>{{ row.delivery_address }}</td>
          <td>{{ row.logistics_company }}</td>
          <td>
            <a v-if="row.tracking_number" :href="getTrackingUrl(row)" target="_blank" class="text-primary-600 hover:text-primary-700 dark:text-primary-400">{{ row.tracking_number }}</a>
            <span v-else>-</span>
          </td>
          <td>{{ row.delivery_date }}</td>
          <td><StatusTag :status="row.status" category="delivery" :label="row.status_display" /></td>
          <td>
            <button class="btn btn-ghost btn-sm" @click="emit('view', row)">查看</button>
            <button v-if="row.status === 'pending'" class="btn btn-ghost btn-sm text-primary-600" @click="emit('edit', row)">编辑</button>
            <button v-if="row.status === 'pending'" class="btn btn-ghost btn-sm text-success-600" @click="emit('ship', row)">发货</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { StatusTag } from '@/components/common'

defineProps({ data: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['view', 'edit', 'ship'])
const getTrackingUrl = (row: any) => `https://www.baidu.com/s?wd=${row.tracking_number || ''}`
</script>
