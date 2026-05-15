<template>
  <el-descriptions title="基本信息" :column="3" border>
    <el-descriptions-item label="施工单号">{{ workOrder?.order_number }}</el-descriptions-item>
    <el-descriptions-item label="客户">{{ workOrder?.customer_name }}</el-descriptions-item>
    <el-descriptions-item label="业务员">{{ salespersonName }}</el-descriptions-item>
    <el-descriptions-item label="制表人">{{ workOrder?.manager_name || '-' }}</el-descriptions-item>
    <el-descriptions-item v-if="workOrder?.product_name" label="产品名称">{{ workOrder.product_name }}</el-descriptions-item>
    <el-descriptions-item v-if="displayQuantity" label="生产数量">{{ displayQuantity }} 车</el-descriptions-item>
    <el-descriptions-item label="总金额">¥{{ workOrder?.total_amount }}</el-descriptions-item>
    <el-descriptions-item label="状态"><StatusTag :status="workOrder?.status" :label="workOrder?.status_display || statusText" category="workOrder" /></el-descriptions-item>
    <el-descriptions-item label="审核状态"><StatusTag :status="workOrder?.approval_status" :label="workOrder?.approval_status_display || approvalStatusText" category="approval" /></el-descriptions-item>
    <el-descriptions-item label="优先级"><StatusTag :status="workOrder?.priority" :label="workOrder?.priority_display || priorityText" category="priority" /></el-descriptions-item>
    <el-descriptions-item label="进度"><el-progress :percentage="workOrder?.progress_percentage ?? progress" :color="workOrder?.progress_percentage === 100 ? '#67C23A' : '#409EFF'" /></el-descriptions-item>
    <el-descriptions-item label="下单日期">{{ formatDate(workOrder?.order_date) }}</el-descriptions-item>
    <el-descriptions-item label="交货日期">{{ formatDate(workOrder?.delivery_date) }}</el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
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
