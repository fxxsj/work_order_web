<template>
  <el-dialog v-model="localVisible" title="发货单详情" width="900px" :close-on-click-modal="false" @close="handleClose">
    <el-descriptions v-if="data" :column="2" border>
      <el-descriptions-item label="发货单号">{{ data.order_number }}</el-descriptions-item>
      <el-descriptions-item label="客户名称">{{ data.customer_name }}</el-descriptions-item>
      <el-descriptions-item label="收货人">{{ data.receiver_name }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ data.receiver_phone }}</el-descriptions-item>
      <el-descriptions-item label="发货日期">{{ data.delivery_date || '-' }}</el-descriptions-item>
      <el-descriptions-item label="物流公司">{{ data.logistics_company || '-' }}</el-descriptions-item>
      <el-descriptions-item label="物流单号"><el-link v-if="data.tracking_number" :href="getTrackingUrl(data)" target="_blank">{{ data.tracking_number }}</el-link><span v-else>-</span></el-descriptions-item>
      <el-descriptions-item label="状态">{{ data.status_display }}</el-descriptions-item>
      <el-descriptions-item label="送货地址" :span="2">{{ data.delivery_address }}</el-descriptions-item>
    </el-descriptions>
    <template #footer><el-button @click="handleClose">关闭</el-button></template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const localVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const getTrackingUrl = (row) => `https://www.baidu.com/s?wd=${row.tracking_number || ''}`
const handleClose = () => emit('update:visible', false)
</script>
