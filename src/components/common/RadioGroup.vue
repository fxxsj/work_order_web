<template>
  <div class="flex flex-wrap gap-3" :class="{ 'flex-col': vertical }">
    <slot>
      <Radio
        v-for="option in options"
        :key="getOptionValue(option)"
        :model-value="modelValue"
        :value="getOptionValue(option)"
        :label="getOptionLabel(option)"
        :disabled="isOptionDisabled(option)"
        @change="emit('update:modelValue', getOptionValue(option))"
      />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import Radio from './Radio.vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: null },
  options: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false },
  vertical: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

provide('radioGroup', {
  props,
  changeEvent: (val: any) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

function getOptionValue(option: any) {
  if (typeof option === 'object' && option !== null) return option.value
  return option
}

function getOptionLabel(option: any) {
  if (typeof option === 'object' && option !== null) return option.label ?? String(option.value)
  return String(option)
}

function isOptionDisabled(option: any) {
  if (typeof option === 'object' && option !== null) return !!option.disabled
  return false
}
</script>
