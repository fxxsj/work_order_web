<template>
  <Select
    :model-value="modelValue"
    :options="normalizedOptions"
    :placeholder="placeholder"
    :filterable="filterable"
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    :multiple="multiple"
    @update:model-value="handleInput"
    @change="handleChange"
    @focus="handleFocus"
  >
    <template #option="{ option }">
      <slot
        name="option"
        :option="option.raw || option"
      >
        <span>{{ option.label }}</span>
      </slot>
    </template>
    <template #empty>
      <slot name="empty">
        <span class="text-sm text-gray-400">暂无数据</span>
      </slot>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@/components/common'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Array] as unknown as () => string | number | boolean | (string | number | boolean)[] | null, required: true },
  placeholder: { type: String, default: '请选择' },
  options: { type: Array as any, default: () => [] },
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

const normalizedOptions = computed(() =>
  props.options.map((option: any) => ({
    value: option[props.valueKey] ?? option,
    label: option[props.labelKey] ?? option,
    disabled: option.disabled || false,
    raw: option
  }))
)

const handleInput = (val: any) => emit('update:modelValue', val)
const handleChange = (val: any) => emit('change', val)
const handleFocus = () => emit('focus')
</script>
