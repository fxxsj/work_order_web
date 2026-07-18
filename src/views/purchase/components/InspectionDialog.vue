<template>
  <BaseDialog
    :show="dialogVisible"
    title="质检确认"
    width="wide"
    @close="handleClose; dialogVisible = false;"
  >
    <div
      class="relative"
      :class="{ 'opacity-50 pointer-events-none': loading }"
    >
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center z-10"
      >
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
      <SummaryTable
        :columns="columns"
        :data="records"
        :loading="loading"
        row-key="id"
      >
        <template #cell-inspection_status="{ row }">
          <StatusTag
            :status="row.inspection_status"
            category="inspection"
            :label="row.inspection_status_display"
            size="small"
          />
        </template>
        <template #cell-actions="{ row }">
          <RowActions
            :actions="getRowActions(row)"
            @action="(action) => handleRowAction(action, row)"
          />
        </template>
      </SummaryTable>
    </div>
    <template #footer>
      <button
        class="btn"
        @click="handleClose"
      >
        取消
      </button><button
        class="btn btn-primary"
        @click="handleSubmit"
      >
        确认
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { StatusTag, SummaryTable, RowActions } from '@/components/common'
import type { Column, RowAction } from '@/components/common/types'

const props = defineProps({ visible: { type: Boolean, default: false }, records: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible', 'inspect', 'stock-in'])

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const canStockIn = (r: any) => r.inspection_status === 'passed'
const showForm = (row: any) => emit('inspect', row)
const handleStockIn = (row: any) => emit('stock-in', row)
const handleSubmit = () => emit('submit')
const handleClose = () => emit('update:visible', false)

const columns: Column[] = [
  { key: 'material_name', label: '物料名称', minWidth: 150 },
  { key: 'material_code', label: '物料编码', width: 120 },
  { key: 'material_specification', label: '规格', minWidth: 160, formatter: value => value || '未填写' },
  { key: 'received_quantity', label: '收货数量', width: 100, align: 'right' },
  { key: 'inspection_status', label: '质检状态', width: 100 },
  { key: 'actions', label: '操作', width: 150 }
]

const getRowActions = (row: any): RowAction[] => [
  { key: 'inspect', label: '质检', icon: 'clipboardCheck', tone: 'primary', visible: row.inspection_status === 'pending' },
  { key: 'stock-in', label: '入库', icon: 'arrowDownTray', tone: 'success', visible: canStockIn(row) }
]

const handleRowAction = (action: RowAction, row: any) => {
  if (action.key === 'inspect') showForm(row)
  if (action.key === 'stock-in') handleStockIn(row)
}
</script>
