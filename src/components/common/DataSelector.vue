<template>
  <Select
    :model-value="selectedValue"
    :options="selectOptions"
    :loading="loading"
    :clearable="clearable"
    :filterable="filterable"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder"
    @update:model-value="handleInput"
    @change="handleChange"
    @focus="handleFocus"
  >
    <template #option="{ option }">
      <slot
        name="option"
        :option="option"
      >
        {{ option[props.labelKey] }}
      </slot>
    </template>
  </Select>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Select } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  fetchMethod: { type: Function, required: true },
  labelKey: { type: String, default: 'label' },
  valueKey: { type: String, default: 'value' },
  modelValue: { type: [String, Number, Array] as unknown as () => string | number | (string | number)[] | null, default: null },
  clearable: { type: Boolean, default: true },
  filterable: { type: Boolean, default: true },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: '请选择' },
  collapseTags: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change', 'focus'])

const selectedValue = ref(props.modelValue)
const options = ref<any[]>([])
const loading = ref(false)

const selectOptions = computed(() => options.value.map((item: any) => ({
  value: item[props.valueKey],
  label: item[props.labelKey],
  raw: item
})))

watch(() => props.modelValue, (val: any) => {
  selectedValue.value = val
})

const remoteMethod = async (query: any) => {
  loading.value = true
  try {
    const res = await props.fetchMethod(query)
    options.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    loading.value = false
  }
}

const handleInput = (val: any) => {
  selectedValue.value = val
  emit('update:modelValue', val)
}
const handleChange = (val: any) => emit('change', val)
const handleFocus = () => {
  emit('focus')
  if (options.value.length === 0) remoteMethod('')
}

// 初始加载
remoteMethod('')
</script>
