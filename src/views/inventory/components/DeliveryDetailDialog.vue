<template>
  <BaseDialog :show="localVisible" title="发货单详情" width="extra-wide" @close="handleClose; localVisible = false;">
    <div v-if="data" class="descriptions-grid" style="--col: 2">
      <div class="description-item"><div class="description-label">发货单号</div><div class="description-value">{{ data.order_number }}</div></div>
      <div class="description-item"><div class="description-label">客户名称</div><div class="description-value">{{ data.customer_name }}</div></div>
      <div class="description-item"><div class="description-label">收货人</div><div class="description-value">{{ data.receiver_name }}</div></div>
      <div class="description-item"><div class="description-label">联系电话</div><div class="description-value">{{ data.receiver_phone }}</div></div>
      <div class="description-item"><div class="description-label">发货日期</div><div class="description-value">{{ data.delivery_date || '-' }}</div></div>
      <div class="description-item"><div class="description-label">物流公司</div><div class="description-value">{{ data.logistics_company || '-' }}</div></div>
      <div class="description-item"><div class="description-label">物流单号</div><div class="description-value"><a v-if="data.tracking_number" :href="getTrackingUrl(data)" target="_blank" class="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400">{{ data.tracking_number }}</a><span v-else>-</span></div></div>
      <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="data.status" category="delivery" :label="data.status_display" /></div></div>
      <div class="description-item col-span-2"><div class="description-label">送货地址</div><div class="description-value">{{ data.delivery_address }}</div></div>
    </div>
    <template #footer><button class="btn" @click="handleClose">关闭</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const localVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const getTrackingUrl = (row: any) => `https://www.baidu.com/s?wd=${row.tracking_number || ''}`
const handleClose = () => emit('update:visible', false)
</script>
