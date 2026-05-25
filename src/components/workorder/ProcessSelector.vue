<template>
  <Select
    :model-value="modelValue"
    label="工序"
    placeholder="请选择工序"
    :options="processOptions"
    multiple
    filterable
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    :hint="showHint ? `已选择 ${selectedCount} 个工序` : ''"
    @update:model-value="v => emit('update:modelValue', v)"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Select } from '@/components/common'
import { processAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ modelValue: { type: Array as any, default: () => [] }, disabled: { type: Boolean, default: false }, showHint: { type: Boolean, default: false }, clearable: { type: Boolean, default: true } })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const processList = ref<any[]>([])
const selectedCount = computed(() => props.modelValue?.length || 0)
const processOptions = computed(() => processList.value.map((p: any) => ({ value: p.id, label: p.name, extra: p.code ? { type: 'info', label: p.code } : null })))

let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000

const fetchProcesses = async () => {
  loading.value = true
  try {
    const res: any = await processAPI.getList({ is_active: true, page_size: 50 })
    processList.value = res?.results || res || []
    cacheTimestamp = Date.now()
  } catch (error: any) { ErrorHandler.handle(error) } finally { loading.value = false }
}

fetchProcesses()
</script>
