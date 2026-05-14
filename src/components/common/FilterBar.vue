<template>
  <div class="filter-bar">
    <el-form :inline="true" :model="filterData" class="filter-form">
      <template v-for="field in fields" :key="field.name">
        <el-form-item v-if="field.type === 'text'" :label="field.label">
          <el-input
            v-model="filterData[field.name]"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :clearable="field.clearable !== false"
            @input="handleFilterChange"
          />
        </el-form-item>
        <el-form-item v-else-if="field.type === 'select'" :label="field.label">
          <el-select
            v-model="filterData[field.name]"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            :filterable="field.filterable"
            :multiple="field.multiple"
            @change="handleFilterChange"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else-if="field.type === 'date'" :label="field.label">
          <el-date-picker
            v-model="filterData[field.name]"
            type="date"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :clearable="field.clearable !== false"
            @change="handleFilterChange"
          />
        </el-form-item>
      </template>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const filterData = reactive({ ...props.modelValue })

watch(() => props.modelValue, (val) => {
  Object.assign(filterData, val)
}, { deep: true })

const handleFilterChange = () => {
  emit('update:modelValue', { ...filterData })
}

const handleSearch = () => {
  emit('search', { ...filterData })
}

const handleReset = () => {
  Object.keys(filterData).forEach(key => {
    filterData[key] = undefined
  })
  emit('update:modelValue', {})
  emit('reset')
}
</script>

<style scoped>
.filter-bar {
  margin-bottom: 20px;
}
.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
</style>
