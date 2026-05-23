<template>
  <div class="descriptions-grid" style="--col: 3">
    <div class="description-item"><div class="description-label">施工单号</div><div class="description-value">{{ workOrder?.order_number }}</div></div>
    <div class="description-item"><div class="description-label">客户</div><div class="description-value">{{ workOrder?.customer_name }}</div></div>
    <div class="description-item"><div class="description-label">业务员</div><div class="description-value">{{ salespersonName }}</div></div>
    <div class="description-item"><div class="description-label">制表人</div><div class="description-value">{{ workOrder?.manager_name || '-' }}</div></div>
    <div v-if="workOrder?.product_name" class="description-item"><div class="description-label">产品名称</div><div class="description-value">{{ workOrder.product_name }}</div></div>
    <div v-if="displayQuantity" class="description-item"><div class="description-label">生产数量</div><div class="description-value">{{ displayQuantity }} 车</div></div>
    <div class="description-item"><div class="description-label">总金额</div><div class="description-value">¥{{ workOrder?.total_amount }}</div></div>
    <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="workOrder?.status" :label="workOrder?.status_display || statusText" category="workOrder" /></div></div>
    <div class="description-item"><div class="description-label">审核状态</div><div class="description-value"><StatusTag :status="workOrder?.approval_status" :label="workOrder?.approval_status_display || approvalStatusText" category="approval" /></div></div>
    <div class="description-item"><div class="description-label">优先级</div><div class="description-value"><StatusTag :status="workOrder?.priority" :label="workOrder?.priority_display || priorityText" category="priority" /></div></div>
    <div class="description-item"><div class="description-label">进度</div><div class="description-value"><ProgressBar :percentage="workOrder?.progress_percentage ?? progress" :color="workOrder?.progress_percentage === 100 ? '#67C23A' : '#409EFF'" /></div></div>
    <div class="description-item"><div class="description-label">下单日期</div><div class="description-value">{{ formatDate(workOrder?.order_date) }}</div></div>
    <div class="description-item"><div class="description-label">交货日期</div><div class="description-value">{{ formatDate(workOrder?.delivery_date) }}</div></div>
  </div>
</template>

<script setup lang="ts">
import { StatusTag } from '@/components/common'
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
