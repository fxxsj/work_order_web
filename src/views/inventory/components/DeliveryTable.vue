<template>
  <el-table v-loading="loading" :data="data" border style="width: 100%">
    <el-table-column prop="order_number" label="发货单号" width="150" />
    <el-table-column prop="customer_name" label="客户名称" width="150" />
    <el-table-column prop="sales_order_number" label="销售订单" width="150" />
    <el-table-column prop="receiver_name" label="收货人" width="100" />
    <el-table-column prop="receiver_phone" label="联系电话" width="120" />
    <el-table-column prop="delivery_address" label="送货地址" show-overflow-tooltip width="200" />
    <el-table-column prop="logistics_company" label="物流公司" width="120" />
    <el-table-column label="物流单号" width="150"><template #default="scope"><el-link v-if="scope.row.tracking_number" :href="getTrackingUrl(scope.row)" target="_blank">{{ scope.row.tracking_number }}</el-link><span v-else>-</span></template></el-table-column>
    <el-table-column prop="delivery_date" label="发货日期" width="120" />
    <el-table-column label="状态" width="100"><template #default="scope"><el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status_display }}</el-tag></template></el-table-column>
    <el-table-column label="操作" width="250" fixed="right"><template #default="scope"><el-button size="small" @click="emit('view', scope.row)">查看</el-button><el-button v-if="scope.row.status === 'pending'" size="small" type="primary" @click="emit('edit', scope.row)">编辑</el-button><el-button v-if="scope.row.status === 'pending'" size="small" type="success" @click="emit('ship', scope.row)">发货</el-button></template></el-table-column>
  </el-table>
</template>

<script setup>
defineProps({ data: { type: Array, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['view', 'edit', 'ship'])
const getStatusType = (s) => ({ pending: 'info', shipped: 'primary', in_transit: 'warning', received: 'success', rejected: 'danger' })[s] || 'info')
const getTrackingUrl = (row) => `https://www.baidu.com/s?wd=${row.tracking_number || ''}`
</script>
