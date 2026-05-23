<template>
  <div class="filter-section">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">发货状态</label>
        <Select v-model="localValue.status" :options="statusOptions" placeholder="全部" clearable class="w-32" @change="handleChange" />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">客户</label>
        <Select v-model="localValue.customer" :options="customerOptions" placeholder="全部客户" clearable searchable class="w-40" @change="handleChange" />
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">物流单号</label>
        <Input v-model="localValue.tracking_number" placeholder="物流单号" clearable class="w-40" @input="handleChange" />
      </div>
      <div class="flex gap-2">
        <button class="btn btn-primary" @click="emit('search')">查询</button>
        <button class="btn" @click="handleReset">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Select, Input } from '@/components/common'

const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, customerList: { type: Array as any, default: () => [] } })
const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const localValue = ref({ ...props.modelValue })
watch(() => props.modelValue, (v: any) => { localValue.value = { ...v } })

const statusOptions = [
  { value: 'pending', label: '待发货' },
  { value: 'shipped', label: '已发货' },
  { value: 'in_transit', label: '运输中' },
  { value: 'received', label: '已签收' }
]
const customerOptions = computed(() => props.customerList.map((c: any) => ({ value: c.id, label: c.name })))

const handleChange = () => emit('update:modelValue', { ...localValue.value })
const handleReset = () => { localValue.value = {}; emit('reset') }
</script>
