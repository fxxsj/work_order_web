<template>
  <BaseDialog
    :show="dialogVisible"
    title="库存不足预警"
    width="wide"
  >
    <Alert
      v-if="materials.length > 0"
      type="warning"
      :closable="false"
      title=""
      description=""
    >
      <template #title>
        发现 {{ materials.length }} 种物料库存不足，建议及时采购补货
      </template>
    </Alert>
    <SummaryTable
      v-if="materials.length > 0"
      :columns="columns"
      :data="materials"
      :loading="loading"
      row-key="id"
    >
      <template #cell-stock_quantity="{ row }">
        <span :class="row.stock_quantity < row.min_stock_quantity ? 'font-bold text-danger-600' : ''">{{ row.stock_quantity }}</span>
      </template>
    </SummaryTable>
    <EmptyState
      v-else
      title="暂无库存不足预警"
    />
    <template #footer>
      <button
        class="btn btn-primary"
        @click="handlePurchase"
      >
        <Icon
          name="plus"
          size="md"
        />
        创建采购订单
      </button>
      <button
        class="btn btn-secondary"
        @click="emit('update:visible', false)"
      >
        关闭
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Alert, EmptyState, Icon, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({ visible: { type: Boolean, default: false }, materials: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['purchase', 'update:visible'])
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const handlePurchase = () => emit('purchase')

const columns: Column[] = [
  { key: 'code', label: '物料编码', width: 120 },
  { key: 'name', label: '物料名称', width: 200 },
  { key: 'stock_quantity', label: '当前库存', width: 120, align: 'right' },
  { key: 'min_stock_quantity', label: '最小库存', width: 120, align: 'right' },
  { key: 'needed_quantity', label: '需要采购', width: 120, align: 'right' }
]
</script>
