<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :filterable="filterable"
    :remote="remote"
    :remote-method="handleRemoteSearch"
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="multiple"
    :collapse-tags="collapseTags"
    :style="selectStyle"
    :reserve-keyword="reserveKeyword"
    :default-first-option="defaultFirstOption"
    @update:model-value="handleInput"
    @change="handleChange"
    @focus="handleFocus"
  >
    <el-option
      v-for="option in displayOptions"
      :key="getOptionValue(option)"
      :label="getOptionLabel(option)"
      :value="getOptionValue(option)"
      :disabled="option.disabled"
    >
      <slot name="option" :option="option">
        <span>{{ getOptionLabel(option) }}</span>
      </slot>
    </el-option>

    <template v-if="showEmptyOption" #empty>
      <slot name="empty">
        <span style="color: #909399; font-size: 13px;">暂无数据</span>
      </slot>
    </template>
  </el-select>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, Array, Boolean], required: true },
  placeholder: { type: String, default: '请选择' },
  options: { type: Array, default: () => [] },
  filterable: { type: Boolean, default: false },
  remote: { type: Boolean, default: false },
  remoteMethod: { type: Function, default: null },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
  collapseTags: { type: Boolean, default: false },
  selectStyle: { type: Object, default: () => ({}) },
  reserveKeyword: { type: Boolean, default: false },
  defaultFirstOption: { type: Boolean, default: false },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  showEmptyOption: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus'])

const displayOptions = computed(() => props.options)

const getOptionLabel = (option) => option[props.labelKey] || option
const getOptionValue = (option) => option[props.valueKey] || option

const handleInput = (val) => emit('update:modelValue', val)
const handleChange = (val) => emit('change', val)
const handleFocus = () => emit('focus')
const handleRemoteSearch = (query) => {
  if (props.remoteMethod) props.remoteMethod(query)
}
</script>
