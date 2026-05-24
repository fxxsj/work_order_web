<template>
  <BaseDialog :show="dialogVisible" title="采购单详情" width="extra-wide">
    <DescriptionGrid :columns="2">
      <DescriptionItem label="采购单号">{{ detailData?.order_number }}</DescriptionItem>
      <DescriptionItem label="供应商">{{ detailData?.supplier_name }}</DescriptionItem>
      <DescriptionItem label="状态">
        <StatusTag :status="detailData?.status" category="purchaseOrder" :label="detailData?.status_display" />
      </DescriptionItem>
      <DescriptionItem label="总金额">¥{{ Number(detailData?.total_amount || 0).toFixed(2) }}</DescriptionItem>
      <DescriptionItem label="关联施工单" :span="2">
        <span
          v-if="detailData?.work_order_number"
          class="cursor-pointer text-primary-600 hover:underline"
          @click="emit('view-work-order', detailData.work_order_number)"
        >
          {{ detailData.work_order_number }}<Icon name="arrowRight" class="h-3 w-3" />
        </span>
        <span v-else>-</span>
      </DescriptionItem>
    </DescriptionGrid>
    <SectionDivider title="采购明细" />
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
import { Icon, StatusTag, SectionDivider, DescriptionGrid, DescriptionItem } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, detailData: { type: Object, default: null } })
const emit = defineEmits(['update:visible', 'view-work-order'])
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
</script>
