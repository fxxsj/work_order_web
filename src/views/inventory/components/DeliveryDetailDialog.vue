<template>
  <BaseDialog
    :show="localVisible"
    title="送货单详情"
    width="extra-wide"
    @close="handleClose; localVisible = false;"
  >
    <DescriptionGrid
      v-if="data"
      :columns="2"
    >
      <DescriptionItem label="送货单号">
        {{ data.order_number }}
      </DescriptionItem>
      <DescriptionItem label="客户名称">
        {{ data.customer_name }}
      </DescriptionItem>
      <DescriptionItem label="收货人">
        {{ data.receiver_name }}
      </DescriptionItem>
      <DescriptionItem label="联系电话">
        {{ data.receiver_phone }}
      </DescriptionItem>
      <DescriptionItem label="发货日期">
        {{ data.delivery_date || '-' }}
      </DescriptionItem>
      <DescriptionItem label="物流公司">
        {{ data.logistics_company || '-' }}
      </DescriptionItem>
      <DescriptionItem label="物流单号">
        <a
          v-if="data.tracking_number"
          :href="getTrackingUrl(data)"
          target="_blank"
          class="text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400"
        >
          {{ data.tracking_number }}
        </a>
        <span v-else>-</span>
      </DescriptionItem>
      <DescriptionItem label="状态">
        <StatusTag
          :status="data.status"
          category="delivery"
          :label="data.status_display"
        />
      </DescriptionItem>
      <DescriptionItem label="未税金额">
        ¥{{ Number(data.subtotal || 0).toFixed(2) }}
      </DescriptionItem>
      <DescriptionItem label="税率">
        {{ Number(data.tax_rate || 0).toFixed(2) }}%
      </DescriptionItem>
      <DescriptionItem label="税额">
        ¥{{ Number(data.tax_amount || 0).toFixed(2) }}
      </DescriptionItem>
      <DescriptionItem label="价税合计">
        ¥{{ Number(data.total_amount || 0).toFixed(2) }}
      </DescriptionItem>
      <DescriptionItem
        label="送货地址"
        :span="2"
      >
        {{ data.delivery_address }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <button
        class="btn"
        @click="handleClose"
      >
        关闭
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag, DescriptionGrid, DescriptionItem } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const localVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const getTrackingUrl = (row: any) => `https://www.baidu.com/s?wd=${row.tracking_number || ''}`
const handleClose = () => emit('update:visible', false)
</script>
