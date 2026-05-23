<template>
  <div class="flex items-start gap-3">
    <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">工序</label>
    <div class="flex-1">
      <Select
        :model-value="modelValue"
        placeholder="请选择工序"
        :options="processOptions"
        multiple
        filterable
        :loading="loading"
        :disabled="disabled"
        :clearable="clearable"
        @update:model-value="v => emit('update:modelValue', v)"
      />
      <div v-if="showHint" class="mt-1 text-xs text-gray-400">已选择 {{ selectedCount }} 个工序</div>
    </div>
  </div>
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

const loadProcesses = async () => {
  const now = Date.now()
  if (processList.value.length === 0 || now - cacheTimestamp > CACHE_DURATION) {
    loading.value = true
    try { const res: any = await processAPI.getList({ is_active: true, page_size: 1000 }); processList.value = res?.results || res || []; cacheTimestamp = now } catch (error: any) { ErrorHandler.handle(error) } finally { loading.value = false }
  }
}

loadProcesses()
</script>
