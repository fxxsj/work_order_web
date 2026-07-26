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
        添加产品
      </BaseButton>
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
          :customer-id="customerId"
          :disabled="disabled || !customerId"
          @update:model-value="v => handleProductChange(index, v)"
          @create="emit('create', $event)"
        />
      </template>
      <template #cell-imposition_quantity="{ row, index }">
        <InputNumber
          :model-value="row.imposition_quantity || 1"
          :min="1"
          :disabled="disabled"
          class="w-full"
          @update:model-value="v => handleImpositionChange(index, v)"
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
import { BaseButton, InputNumber, LineItemsTable } from '@/components/common'
import ProductSelector from '@/views/product/components/ProductSelector.vue'

const props = defineProps({
  items: { type: Array as any, default: () => [] },
  customerId: { type: [Number, String], default: null },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove', 'change', 'create', 'productSelected'])

const columns = [
  { key: 'product', label: '产品', minWidth: 250 },
  { key: 'imposition_quantity', label: '拼板数', width: 100 },
  { key: 'quantity', label: '数量', width: 150 },
  { key: 'unit', label: '单位', width: 80 }
]

const handleProductChange = (index: any, value: any) => {
  const item = { ...props.items[index], product: value }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
  // Emit product selected event with full product data for auto-fill
  if (value) {
    emit('productSelected', index, value)
  }
}

const handleImpositionChange = (index: any, value: any) => {
  const item = { ...props.items[index], imposition_quantity: value }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleQuantityChange = (index: any, value: any) => {
  const item = { ...props.items[index], quantity: value, manual_quantity: true }
  const newItems = [...props.items]
  newItems[index] = item
  emit('change', newItems)
}

const handleRemove = (index: any) => emit('remove', index)
</script>
