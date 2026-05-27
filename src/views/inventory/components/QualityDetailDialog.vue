<template>
  <BaseDialog
    :show="visible"
    title="质检详情"
    width="wide"
    @close="visible = false"
  >
    <DescriptionGrid
      v-if="data"
      :columns="2"
    >
      <DescriptionItem label="质检单号">
        {{ data.inspection_number || '-' }}
      </DescriptionItem>
      <DescriptionItem label="产品名称">
        {{ data.product_name || '-' }}
      </DescriptionItem>
      <DescriptionItem label="客户">
        {{ data.customer_name || '-' }}
      </DescriptionItem>
      <DescriptionItem label="施工单">
        {{ data.work_order_number || '-' }}
      </DescriptionItem>
      <DescriptionItem label="检验类型">
        {{ data.inspection_type_display || data.inspection_type || '-' }}
      </DescriptionItem>
      <DescriptionItem label="检验结果">
        <StatusTag
          :status="data.result"
          category="inspection"
          :label="data.result_display"
        />
      </DescriptionItem>
      <DescriptionItem label="检验数量">
        {{ data.inspection_quantity ?? 0 }}
      </DescriptionItem>
      <DescriptionItem label="合格数量">
        {{ data.passed_quantity || 0 }}
      </DescriptionItem>
      <DescriptionItem label="不合格数量">
        {{ data.failed_quantity || 0 }}
      </DescriptionItem>
      <DescriptionItem label="不良率">
        {{ data.defective_rate_formatted || `${Number(data.defective_rate || 0).toFixed(2)}%` }}
      </DescriptionItem>
      <DescriptionItem label="批次号">
        {{ data.batch_no || '-' }}
      </DescriptionItem>
      <DescriptionItem label="检验日期">
        {{ data.inspection_date || '-' }}
      </DescriptionItem>
      <DescriptionItem label="检验员">
        {{ data.inspector_name || '-' }}
      </DescriptionItem>
    </DescriptionGrid>
    <template #footer>
      <button
        class="btn"
        @click="visible = false"
      >
        关闭
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag, DescriptionGrid, DescriptionItem } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['update:visible'])
const visible = computed({ get: () => props.visible, set: (v: any) => emit('update:visible', v) })
</script>
