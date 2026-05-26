<template>
  <DescriptionGrid :columns="3">
    <DescriptionItem label="施工单号">
      {{ workOrder?.order_number }}
    </DescriptionItem>
    <DescriptionItem label="客户">
      {{ workOrder?.customer_name }}
    </DescriptionItem>
    <DescriptionItem label="业务员">
      {{ salespersonName }}
    </DescriptionItem>
    <DescriptionItem label="制表人">
      {{ workOrder?.manager_name || '-' }}
    </DescriptionItem>
    <DescriptionItem
      v-if="workOrder?.product_name"
      label="产品名称"
    >
      {{ workOrder.product_name }}
    </DescriptionItem>
    <DescriptionItem
      v-if="displayQuantity"
      label="生产数量"
    >
      {{ displayQuantity }} 车
    </DescriptionItem>
    <DescriptionItem label="总金额">
      ¥{{ workOrder?.total_amount }}
    </DescriptionItem>
    <DescriptionItem label="状态">
      <StatusTag
        :status="workOrder?.status"
        :label="workOrder?.status_display || statusText"
        category="workOrder"
      />
    </DescriptionItem>
    <DescriptionItem label="审核状态">
      <StatusTag
        :status="workOrder?.approval_status"
        :label="workOrder?.approval_status_display || approvalStatusText"
        category="approval"
      />
    </DescriptionItem>
    <DescriptionItem label="优先级">
      <StatusTag
        :status="workOrder?.priority"
        :label="workOrder?.priority_display || priorityText"
        category="priority"
      />
    </DescriptionItem>
    <DescriptionItem label="进度">
      <ProgressBar
        :percentage="workOrder?.progress_percentage ?? progress"
        :status="workOrder?.progress_percentage === 100 ? 'success' : 'active'"
      />
    </DescriptionItem>
    <DescriptionItem label="下单日期">
      {{ formatDate(workOrder?.order_date) }}
    </DescriptionItem>
    <DescriptionItem label="交货日期">
      {{ formatDate(workOrder?.delivery_date) }}
    </DescriptionItem>
  </DescriptionGrid>
</template>

<script setup lang="ts">
import { StatusTag, DescriptionGrid, DescriptionItem } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({
  workOrder: { type: Object, default: null },
  salespersonName: { type: String, default: '' },
  displayQuantity: { type: [Number, String], default: null },
  progress: { type: Number, default: 0 },
  statusText: { type: String, default: '' },
  approvalStatusText: { type: String, default: '' },
  priorityText: { type: String, default: '' }
})
</script>
