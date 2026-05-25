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
    :hint="showHint && selectedCount > 0 ? `已选择 ${selectedCount} 项` : ''"
    @update:model-value="v => emit('update:modelValue', v)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Select } from '@/components/common'

const props = defineProps({
  modelValue: { type: Array as any, default: () => [] },
  options: { type: Array as any, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '请选择' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  showHint: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const selectedCount = computed(() => props.modelValue?.length || 0)
</script>
