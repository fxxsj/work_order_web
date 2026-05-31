<template>
  <CheckboxGroup
    :model-value="modelValue"
    :options="processOptions"
    variant="chip"
    :disabled="disabled"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckboxGroup } from '@/components/common'

const props = defineProps({
  modelValue: { type: Array as any, default: () => [] },
  processList: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const processOptions = computed(() =>
  props.processList.map((p: any) => ({
    value: p.id,
    label: p.name,
    disabled: !p.is_active
  }))
)
</script>
