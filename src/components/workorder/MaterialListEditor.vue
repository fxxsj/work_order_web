<template>
  <div>
    <div class="mb-4 flex gap-2">
      <button
        v-if="!disabled"
        class="btn btn-primary btn-sm"
        @click="emit('add')"
      >
        <Icon
          name="plus"
          class="h-3 w-3"
        />
        添加物料
      </button>
    </div>
    <LineItemsTable
      :columns="columns"
      :items="items"
      :delete-disabled="() => disabled || items.length <= 1"
      @delete="handleRemove"
    >
      <template #cell-material="{ row, index }">
        <MaterialSelector
          :model-value="row.material"
          :materials="materials"
          :disabled="disabled"
          @update:model-value="v => handleMaterialChange(index, v)"
          @create="emit('create', index)"
        />
      </template>
      <template #cell-quantity="{ row, index }">
        <InputNumber
          :model-value="row.quantity"
          :min="1"
          :disabled="disabled"
          class="w-full"
          @update:model-value="v => handleQuantityChange(index, v)"
        />
      </template>
      <template #cell-unit="{ row }">
        <span>{{ getMaterialUnit(row.material) }}</span>
      </template>
      <template #cell-notes="{ row, index }">
        <Input
          :model-value="row.notes"
          placeholder="备注"
          class="w-full"
          :disabled="disabled"
          @update:model-value="v => handleNotesChange(index, v)"
        />
      </template>
    </LineItemsTable>
  </div>
</template>

<script setup lang="ts">
import { Icon, InputNumber, Input, LineItemsTable } from '@/components/common'
import MaterialSelector from '@/views/material/components/MaterialSelector.vue'

const props = defineProps({
  items: { type: Array as any, default: () => [] },
  materials: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove', 'change', 'create'])

const columns = [
  { key: 'material', label: '物料', minWidth: 200 },
  { key: 'quantity', label: '数量', width: 120 },
  { key: 'unit', label: '单位', width: 80 },
  { key: 'notes', label: '备注', minWidth: 150 }
]

const getMaterialUnit = (materialId: any) => {
  const material = props.materials.find((m: any) => m.id === materialId)
  return material?.unit || '-'
}

const handleMaterialChange = (index: any, value: any) => {
  const item = { ...props.items[index], material: value }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleQuantityChange = (index: any, value: any) => {
  const item = { ...props.items[index], quantity: value }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleNotesChange = (index: any, value: any) => {
  const item = { ...props.items[index], notes: value }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleRemove = (index: any) => emit('remove', index)
</script>
