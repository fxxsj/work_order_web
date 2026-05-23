<template>
  <div class="mb-6">
    <div class="flex flex-wrap items-center gap-3">
      <template v-for="field in fields" :key="field.name">
        <div v-if="field.type === 'text'" class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ field.label }}</label>
          <SearchInput
            :model-value="filterData[field.name]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            @update:model-value="v => { filterData[field.name] = v; handleFilterChange() }"
          />
        </div>
        <div v-else-if="field.type === 'select'" class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ field.label }}</label>
          <Select
            :model-value="filterData[field.name]"
            :options="field.options"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            :filterable="field.filterable"
            :multiple="field.multiple"
            @update:model-value="v => { filterData[field.name] = v; handleFilterChange() }"
          />
        </div>
        <div v-else-if="field.type === 'date'" class="flex items-center gap-2">
          <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ field.label }}</label>
          <input
            type="date"
            :value="filterData[field.name]"
            class="input"
            :placeholder="field.placeholder || `请选择${field.label}`"
            @input="v => { filterData[field.name] = (v.target as HTMLInputElement)?.value || ''; handleFilterChange() }"
          />
        </div>
      </template>
      <div class="flex items-center gap-2">
        <button class="btn btn-primary btn-sm" @click="handleSearch">查询</button>
        <button class="btn btn-secondary btn-sm" @click="handleReset">重置</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Select, SearchInput } from '@/components/common'

const props = defineProps({
  fields: { type: Array as any, default: () => [] },
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const filterData = reactive({ ...props.modelValue })

watch(() => props.modelValue, (val: any) => {
  Object.assign(filterData, val)
}, { deep: true })

const handleFilterChange = () => {
  emit('update:modelValue', { ...filterData })
}

const handleSearch = () => {
  emit('search', { ...filterData })
}

const handleReset = () => {
  Object.keys(filterData).forEach((key: any) => {
    filterData[key] = undefined
  })
  emit('update:modelValue', {})
  emit('reset')
}
</script>
