<template>
  <div class="card mt-6">
    <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-dark-700">
      <span class="font-bold">物料信息</span>
      <button v-if="editable" class="btn btn-primary btn-sm" @click="emit('add-material')"><Icon name="plus" class="h-3 w-3" /> 添加物料</button>
    </div>
    <SummaryTable :columns="columns" :data="materials">
      <template #cell-name="{ row }">{{ row.material_name }} ({{ row.material_code }})</template>
      <template #cell-notes="{ row }">{{ row.notes || '-' }}</template>
      <template #cell-purchase_status="{ row }">
        <StatusTag :status="row.purchase_status" category="materialPurchase" size="small" />
      </template>
      <template #cell-purchase_date="{ row }">{{ formatDate(row.purchase_date) }}</template>
      <template #cell-actions="{ row }">
        <button class="btn btn-primary btn-sm" :disabled="!editable" @click="emit('update-status', row)">更新状态</button>
      </template>
    </SummaryTable>
  </div>
</template>

<script setup lang="ts">
import { Icon, StatusTag, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'

defineProps({ materials: { type: Array as any, default: () => [] }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['add-material', 'update-status'])

const columns: Column[] = [
  { key: 'name', label: '物料名称' },
  { key: 'material_size', label: '尺寸', width: 100 },
  { key: 'material_usage', label: '用量', width: 100 },
  { key: 'notes', label: '备注' },
  { key: 'purchase_status', label: '采购状态', width: 96, align: 'center' },
  { key: 'purchase_date', label: '采购日期', width: 112 },
  { key: 'actions', label: '操作', width: 112, align: 'center' },
]
</script>
