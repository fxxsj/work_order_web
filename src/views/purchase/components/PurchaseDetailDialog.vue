<template>
  <BaseDialog :show="dialogVisible" title="采购单详情" width="extra-wide">
    <div class="descriptions-grid" style="--col: 2">
      <div class="description-item"><div class="description-label">采购单号</div><div class="description-value">{{ detailData?.order_number }}</div></div>
      <div class="description-item"><div class="description-label">供应商</div><div class="description-value">{{ detailData?.supplier_name }}</div></div>
      <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="detailData?.status" category="purchaseOrder" :label="detailData?.status_display" /></div></div>
      <div class="description-item"><div class="description-label">总金额</div><div class="description-value">¥{{ Number(detailData?.total_amount || 0).toFixed(2) }}</div></div>
      <div class="description-item col-span-2"><div class="description-label">关联施工单</div><div class="description-value"><span v-if="detailData?.work_order_number" class="cursor-pointer text-primary-600 hover:underline" @click="emit('view-work-order', detailData.work_order_number)">{{ detailData.work_order_number }}<Icon name="arrowRight" class="h-3 w-3" /></span><span v-else>-</span></div></div>
    </div>
    <div class="flex items-center my-4"><span class="pr-3 text-sm text-gray-500 dark:text-gray-400">采购明细</span><hr class="flex-1 border-t border-gray-200 dark:border-dark-700" /></div>
    <table class="data-table w-full">
      <thead>
        <tr>
          <th class="w-[200px] text-left">物料</th>
          <th class="w-[120px] text-left">物料编码</th>
          <th class="w-[100px] text-right">数量</th>
          <th class="w-[100px] text-right">单价</th>
          <th class="w-[100px] text-right">小计</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in (detailData?.items || [])" :key="index">
          <td>{{ row.material_name }}</td>
          <td>{{ row.material_code }}</td>
          <td class="text-right">{{ row.quantity }}</td>
          <td class="text-right">{{ row.unit_price }}</td>
          <td class="text-right">{{ row.subtotal }}</td>
        </tr>
      </tbody>
    </table>
    <template #footer><button class="btn" @click="emit('update:visible', false)">关闭</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, detailData: { type: Object, default: null } })
const emit = defineEmits(['update:visible', 'view-work-order'])
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
</script>
