<template>
  <div>
    <div class="mb-4 flex gap-2">
      <BaseButton
        v-if="!disabled"
        variant="primary"
        size="sm"
        icon="plus"
        @click="emit('add')"
      >
        添加物料
      </BaseButton>
    </div>
    <LineItemsTable
      :columns="columns"
      :items="items"
      :delete-disabled="() => disabled || items.length <= 1"
      @delete="handleRemove"
    >
      <template #cell-material="{ row, index }">
        <div class="flex items-center gap-2">
          <MaterialSelector
            :model-value="row.material"
            :materials="materials"
            :disabled="disabled"
            @update:model-value="v => handleMaterialChange(index, v)"
            @create="emit('create', index)"
          />
          <span
            v-if="row.auto_filled"
            class="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
          >
            自动
          </span>
        </div>
      </template>
      <template #cell-material_size="{ row, index }">
        <Input
          :model-value="row.material_size"
          placeholder="规格"
          class="w-full"
          :disabled="disabled"
          @update:model-value="v => handleFieldChange(index, 'material_size', v)"
        />
      </template>
      <template #cell-material_usage="{ row, index }">
        <Input
          :model-value="row.material_usage"
          placeholder="用量"
          class="w-full"
          :disabled="disabled"
          @update:model-value="v => handleFieldChange(index, 'material_usage', v)"
        />
      </template>
      <template #cell-need_cutting="{ row, index }">
        <input
          type="checkbox"
          :checked="row.need_cutting"
          :disabled="disabled"
          class="h-4 w-4 rounded border-gray-300"
          @change="handleFieldChange(index, 'need_cutting', !row.need_cutting)"
        >
      </template>
      <template #cell-planning_required="{ row, index }">
        <input
          type="checkbox"
          :checked="row.planning_required"
          :disabled="disabled"
          class="h-4 w-4 rounded border-gray-300"
          @change="handleFieldChange(index, 'planning_required', !row.planning_required)"
        >
      </template>
      <template #cell-notes="{ row, index }">
        <Input
          :model-value="row.notes"
          placeholder="备注"
          class="w-full"
          :disabled="disabled"
          @update:model-value="v => handleFieldChange(index, 'notes', v)"
        />
      </template>
    </LineItemsTable>
  </div>
</template>

<script setup lang="ts">
import { BaseButton, Input, LineItemsTable } from '@/components/common'
import MaterialSelector from '@/views/material/components/MaterialSelector.vue'

const props = defineProps({
  items: { type: Array as any, default: () => [] },
  materials: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove', 'change', 'create'])

const columns = [
  { key: 'material', label: '物料', minWidth: 200 },
  { key: 'material_size', label: '规格', width: 120 },
  { key: 'material_usage', label: '用量', width: 120 },
  { key: 'need_cutting', label: '需切割', width: 80 },
  { key: 'planning_required', label: '拼版后规划', width: 96 },
  { key: 'notes', label: '备注', minWidth: 150 }
]

const handleMaterialChange = (index: any, value: any) => {
  const item = { ...props.items[index], material: value, auto_filled: false }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleFieldChange = (index: any, field: string, value: any) => {
  const item = { ...props.items[index], [field]: value }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleRemove = (index: any) => emit('remove', index)
</script>
