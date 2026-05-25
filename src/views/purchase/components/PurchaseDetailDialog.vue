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
    <SummaryTable
      :columns="columns"
      :data="detailData?.items || []"
      row-key="id"
    />
    <template #footer><button class="btn" @click="emit('update:visible', false)">关闭</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon, StatusTag, SectionDivider, DescriptionGrid, DescriptionItem, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({ visible: { type: Boolean, default: false }, detailData: { type: Object, default: null } })
const emit = defineEmits(['update:visible', 'view-work-order'])
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

const columns: Column[] = [
  { key: 'material_name', label: '物料', width: 200 },
  { key: 'material_code', label: '物料编码', width: 120 },
  { key: 'quantity', label: '数量', width: 100, align: 'right' },
  { key: 'unit_price', label: '单价', width: 100, align: 'right' },
  { key: 'subtotal', label: '小计', width: 100, align: 'right' }
]
</script>
