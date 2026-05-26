<template>
  <Select
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder"
    :options="options"
    multiple
    filterable
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    @update:model-value="v => emit('update:modelValue', v)"
  />
</template>

<script setup lang="ts">
import { Select } from '@/components/common'

const props = defineProps({
  modelValue: { type: Array as any, default: () => [] },
  options: { type: Array as any, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '请选择' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue'])
</script>
