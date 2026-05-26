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
        添加产品
      </button>
    </div>
    <LineItemsTable
      :columns="columns"
      :items="items"
      :delete-disabled="() => disabled || items.length <= 1"
      @delete="handleRemove"
    >
      <template #cell-product="{ row, index }">
        <ProductSelector
          :model-value="row.product"
          :disabled="disabled"
          @update:model-value="v => handleProductChange(index, v)"
          @create="emit('create', $event)"
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
        <span>{{ row.unit || '件' }}</span>
      </template>
    </LineItemsTable>
  </div>
</template>

<script setup lang="ts">
import { Icon, InputNumber, LineItemsTable } from '@/components/common'
import ProductSelector from '@/views/product/components/ProductSelector.vue'

const props = defineProps({
  items: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove', 'change', 'create'])

const columns = [
  { key: 'product', label: '产品', minWidth: 250 },
  { key: 'quantity', label: '数量', width: 150 },
  { key: 'unit', label: '单位', width: 80 }
]

const handleProductChange = (index: any, value: any) => {
  const item = { ...props.items[index], product: value }
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

const handleRemove = (index: any) => emit('remove', index)
</script>
