<template>
  <div class="date-range-picker flex items-center gap-2">
    <input
      type="date"
      :value="startDate"
      :disabled="disabled"
      class="input"
      :placeholder="startPlaceholder"
      @input="handleStartChange"
    />
    <span class="text-gray-400">{{ rangeSeparator }}</span>
    <input
      type="date"
      :value="endDate"
      :disabled="disabled"
      class="input"
      :placeholder="endPlaceholder"
      @input="handleEndChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array as any, default: () => [] },
  startPlaceholder: { type: String, default: '开始日期' },
  endPlaceholder: { type: String, default: '结束日期' },
  rangeSeparator: { type: String, default: '至' },
  clearable: { type: Boolean, default: true },
  valueFormat: { type: String, default: 'YYYY-MM-DD' },
  format: { type: String, default: 'YYYY-MM-DD' },
  disabled: { type: Boolean, default: false },
  unlinkPanels: { type: Boolean, default: false },
  shortcuts: { type: Array as any, default: () => [] },
  disabledDate: { type: Function, default: null }
})

const emit = defineEmits(['update:modelValue', 'change'])

const startDate = computed(() => props.modelValue?.[0] || '')
const endDate = computed(() => props.modelValue?.[1] || '')

const handleStartChange = (e: any) => {
  const val = [e.target.value, endDate.value]
  emit('update:modelValue', val)
  emit('change', val)
}

const handleEndChange = (e: any) => {
  const val = [startDate.value, e.target.value]
  emit('update:modelValue', val)
  emit('change', val)
}
</script>

<style>
.date-range-picker {
  display: inline-flex;
}
</style>
