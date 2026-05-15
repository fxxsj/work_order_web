<template>
  <el-card>
    <template #header><div class="card-header"><span>最近的施工单</span><el-button type="primary" size="small" @click="goTo('/workorders')">查看全部</el-button></div></template>
    <el-table :data="recentOrders" style="width: 100%">
      <el-table-column prop="order_number" label="施工单号" width="150" />
      <el-table-column prop="customer_name" label="客户" min-width="120" />
      <el-table-column prop="product_name" label="产品名称" min-width="150" show-overflow-tooltip />
      <el-table-column label="状态" width="100"><template #default="scope"><StatusTag :status="scope.row.status" :label="scope.row.status_display" category="workOrder" size="small" /></template></el-table-column>
      <el-table-column label="进度" width="150"><template #default="scope"><el-progress :percentage="scope.row.progress_percentage || 0" :color="scope.row.progress_percentage === 100 ? '#67C23A' : '#409EFF'" /></template></el-table-column>
      <el-table-column label="交货日期" width="120"><template #default="scope">{{ formatDate(scope.row.delivery_date) }}</template></el-table-column>
      <el-table-column label="操作" width="100" fixed="right"><template #default="scope"><el-button type="text" size="small" @click="goTo(`/workorders/${scope.row.id}`)">查看</el-button></template></el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { StatusTag } from '@/components/common'

defineProps({ recentOrders: { type: Array, default: () => [] } })
const router = useRouter()
const goTo = (path) => router.push(path)

const formatDate = (d) => d ? new Date(d).toLocaleDateString('zh-CN') : '-';
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
</style>
