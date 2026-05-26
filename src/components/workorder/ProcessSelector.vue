<template>
  <CheckboxGroup
    :model-value="modelValue"
    :options="processOptions"
    variant="chip"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckboxGroup } from '@/components/common'
import { processAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ modelValue: { type: Array as any, default: () => [] }, disabled: { type: Boolean, default: false } })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const processList = ref<any[]>([])
const processOptions = computed(() => processList.value.map((p: any) => ({ value: p.id, label: p.name, disabled: !p.is_active })))

const fetchProcesses = async () => {
  loading.value = true
  try {
    const res: any = await processAPI.getList({ is_active: true, page_size: 100 })
    processList.value = res?.results || res || []
  } catch (error: any) { ErrorHandler.handle(error) } finally { loading.value = false }
}

fetchProcesses()
</script>
