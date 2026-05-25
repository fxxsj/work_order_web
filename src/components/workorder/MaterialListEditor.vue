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
      <button
        v-if="!disabled"
        class="btn btn-secondary btn-sm"
        @click="emit('create')"
      >
        <Icon
          name="plus"
          class="h-3 w-3"
        />
        新建物料
      </button>
    </div>
    <LineItemsTable
      :columns="columns"
      :items="items"
      :delete-disabled="() => disabled || items.length <= 1"
      @delete="handleRemove"
    >
      <template #cell-material="{ row, index }">
        <Select
          :model-value="row.material"
          :options="materialOptions"
          placeholder="选择物料"
          filterable
          :disabled="disabled"
          searchable
          @update:model-value="v => handleMaterialChange(index, v)"
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
import { computed } from 'vue'
import { Icon, InputNumber, Input, Select, LineItemsTable } from '@/components/common'

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

const materialOptions = computed(() =>
  props.materials.map((m: any) => ({
    value: m.id,
    label: `${m.name} (${m.code || '无编码'})`
  }))
)

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
