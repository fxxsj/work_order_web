<template>
  <div class="flex items-start gap-3">
    <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">产品列表</label>
    <div class="flex-1">
      <div v-for="(item, index) in items" :key="index" class="mb-3">
        <div class="flex flex-wrap items-center gap-3">
          <div class="w-full md:w-64"><ProductSelector :model-value="item.product" :disabled="disabled" @update:model-value="v => handleProductChange(index, v)" /></div>
          <div class="w-32"><InputNumber :model-value="item.quantity" :min="1" :disabled="disabled" @update:model-value="v => handleQuantityChange(index, v)" class="w-full" /> <span class="ml-1 text-sm text-gray-500">{{ item.unit || '件' }}</span></div>
          <button v-if="items.length > 1" class="btn btn-danger btn-sm" :disabled="disabled" @click="handleRemove(index)">删除</button>
        </div>
      </div>
      <button v-if="!disabled" class="btn btn-primary btn-sm" @click="emit('add')"><Icon name="plus" class="h-3 w-3" /> 添加产品</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon, InputNumber } from '@/components/common'
import ProductSelector from './ProductSelector.vue'

const props = defineProps({ items: { type: Array as any, default: () => [] }, disabled: { type: Boolean, default: false } })
const emit = defineEmits(['add', 'remove', 'change'])

const handleProductChange = (index: any, value: any) => { const item = { ...props.items[index], product: value }; const newItems = [...props.items]; newItems[index] = item; emit('change', newItems) }
const handleQuantityChange = (index: any, value: any) => { const item = { ...props.items[index], quantity: value }; const newItems = [...props.items]; newItems[index] = item; emit('change', newItems) }
const handleRemove = (index: any) => emit('remove', index)
</script>
