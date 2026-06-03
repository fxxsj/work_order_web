<template>
  <div class="card p-6">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="text-lg font-bold">物料信息</span>
      <BaseButton
        variant="primary"
        size="sm"
        icon="plus"
        @click="emit('add-material')"
      >
        添加物料
      </BaseButton>
    </div>
    <SummaryTable
      v-if="materials?.length"
      :columns="columns"
      :data="materials"
      :row-key="rowKey"
    >
      <template #cell-material_name="{ row }">
        {{ row.material_name }} ({{ row.material_code }})
      </template>
      <template #cell-need_cutting="{ row }">
        {{ row.need_cutting ? '是' : '否' }}
      </template>
      <template #cell-purchase_status="{ row }">
        <StatusTag
          :status="row.purchase_status"
          :label="row.purchase_status_display"
          category="materialPurchase"
          size="small"
        />
      </template>
      <template #cell-actions="{ row }">
        <button
          class="btn btn-ghost btn-sm text-primary-600"
          @click="emit('update-material', row)"
        >
          编辑
        </button>
      </template>
    </SummaryTable>
    <EmptyState
      v-else
      title="暂无物料"
    />
  </div>
</template>

<script setup lang="ts">
import { BaseButton, StatusTag, EmptyState, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'

const props = defineProps({ materials: { type: Array as any, default: () => [] } })
const emit = defineEmits(['add-material', 'update-material'])

const columns: Column[] = [
  { key: 'material_name', label: '物料名称', minWidth: 176 },
  { key: 'material_size', label: '尺寸', minWidth: 120 },
  { key: 'material_usage', label: '用量', minWidth: 120 },
  { key: 'material_unit', label: '单位', width: 96, align: 'center', formatter: value => value || '-' },
  { key: 'need_cutting', label: '需开料', width: 96, align: 'center' },
  { key: 'notes', label: '备注', minWidth: 160, className: 'max-w-[200px] truncate', formatter: value => value || '-' },
  { key: 'purchase_status', label: '采购状态', minWidth: 120 },
  { key: 'purchase_date', label: '采购日期', minWidth: 120, formatter: value => formatDate(value) },
  { key: 'received_date', label: '回料日期', minWidth: 120, formatter: value => formatDate(value) },
  { key: 'cut_date', label: '开料日期', minWidth: 120, formatter: value => formatDate(value) },
  { key: 'actions', label: '操作', width: 96, align: 'center' },
]

const rowKey = (row: any, index: number) => row.id || row.material_code || index
</script>
