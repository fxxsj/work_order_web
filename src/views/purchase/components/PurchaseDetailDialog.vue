<template>
  <el-dialog v-model="dialogVisible" title="采购单详情" width="var(--ui-dialog-width-xl)">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="采购单号">{{ detailData?.order_number }}</el-descriptions-item>
      <el-descriptions-item label="供应商">{{ detailData?.supplier_name }}</el-descriptions-item>
      <el-descriptions-item label="状态"><StatusTag :status="detailData?.status" category="purchaseOrder" :label="detailData?.status_display" /></el-descriptions-item>
      <el-descriptions-item label="总金额">¥{{ Number(detailData?.total_amount || 0).toFixed(2) }}</el-descriptions-item>
      <el-descriptions-item label="关联施工单">
        <span v-if="detailData?.work_order_number" class="work-order-link" @click="emit('view-work-order', detailData.work_order_number)">
          {{ detailData.work_order_number }}<el-icon class="link-icon"><ArrowRight /></el-icon>
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>
    <el-divider>采购明细</el-divider>
    <el-table :data="detailData?.items || []" border>
      <el-table-column prop="material_name" label="物料" width="200" />
      <el-table-column prop="material_code" label="物料编码" width="120" />
      <el-table-column prop="quantity" label="数量" width="100" align="right" />
      <el-table-column prop="unit_price" label="单价" width="100" align="right" />
      <el-table-column prop="subtotal" label="小计" width="100" align="right" />
    </el-table>
    <template #footer><el-button @click="emit('update:visible', false)">关闭</el-button></template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { StatusTag } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, detailData: { type: Object, default: null } })
const emit = defineEmits(['update:visible', 'view-work-order'])
const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
</script>

<style scoped>
.work-order-link { color: var(--el-color-primary); cursor: pointer; display: inline-flex; align-items: center; gap: 2px; }
.work-order-link:hover { text-decoration: underline; }
.link-icon { font-size: 12px; }
</style>
