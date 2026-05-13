<template>
  <div class="filter-section">
    <el-form :inline="true" :model="localValue" class="filter-form">
      <el-form-item label="发货状态"><el-select v-model="localValue.status" placeholder="全部" clearable @change="handleChange"><el-option label="待发货" value="pending" /><el-option label="已发货" value="shipped" /><el-option label="运输中" value="in_transit" /><el-option label="已签收" value="received" /></el-select></el-form-item>
      <el-form-item label="客户"><el-select v-model="localValue.customer" placeholder="全部客户" clearable filterable @change="handleChange"><el-option v-for="c in customerList" :key="c.id" :label="c.name" :value="c.id" /></el-select></el-form-item>
      <el-form-item label="物流单号"><el-input v-model="localValue.tracking_number" placeholder="物流单号" clearable @input="handleChange" /></el-form-item>
      <el-form-item><el-button type="primary" @click="emit('search')">查询</el-button><el-button @click="handleReset">重置</el-button></el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, customerList: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const localValue = ref({ ...props.modelValue })
watch(() => props.modelValue, (v) => { localValue.value = { ...v } })
const handleChange = () => emit('update:modelValue', { ...localValue.value })
const handleReset = () => { localValue.value = {}; emit('reset') }
</script>
