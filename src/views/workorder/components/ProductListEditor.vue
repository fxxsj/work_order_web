<template>
  <el-form-item label="产品列表" required>
    <div v-for="(item, index) in items" :key="index" class="product-item">
      <el-row :gutter="10" type="flex" align="middle">
        <el-col :xs="24" :sm="12" :md="10"><ProductSelector :model-value="item.product" :disabled="disabled" @update:model-value="v => handleProductChange(index, v)" /></el-col>
        <el-col :xs="24" :sm="8" :md="4"><el-input-number :model-value="item.quantity" :min="1" :disabled="disabled" @update:model-value="v => handleQuantityChange(index, v)" style="width: 100%;"><template #suffix>{{ item.unit || '件' }}</template></el-input-number></el-col>
        <el-col v-if="items.length > 1" :xs="24" :sm="4" :md="2"><el-button type="danger" size="small" :disabled="disabled" @click="handleRemove(index)">删除</el-button></el-col>
      </el-row>
    </div>
    <el-button v-if="!disabled" type="primary" size="small" :icon="Plus" @click="emit('add')">添加产品</el-button>
  </el-form-item>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import ProductSelector from './ProductSelector.vue'

const props = defineProps({ items: { type: Array, default: () => [] }, disabled: { type: Boolean, default: false } })
const emit = defineEmits(['add', 'remove', 'change'])

const handleProductChange = (index, value) => { const item = { ...props.items[index], product: value }; const newItems = [...props.items]; newItems[index] = item; emit('change', newItems) }
const handleQuantityChange = (index, value) => { const item = { ...props.items[index], quantity: value }; const newItems = [...props.items]; newItems[index] = item; emit('change', newItems) }
const handleRemove = (index) => emit('remove', index)
</script>

<style scoped>
.product-item { margin-bottom: 10px; }
.product-item :deep(.el-row) { row-gap: var(--ui-control-gap); }
</style>
