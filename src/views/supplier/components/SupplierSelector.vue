<template>
  <Select
    :model-value="modelValue"
    :options="supplierSelectOptions"
    placeholder="请选择供应商"
    filterable
    remote
    :remote-method="searchSuppliers"
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    creatable
    class="w-full"
    @update:model-value="v => emit('update:modelValue', v)"
    @create="handleCreate"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Select } from '@/components/common'
import { supplierAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  modelValue: { type: Number, default: null },
  suppliers: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'create'])

const loading = ref(false)
const supplierList = ref<any[]>([])

const supplierSelectOptions = computed(() =>
  supplierList.value.map((supplier: any) => ({
    value: supplier.id,
    label: supplier.name,
    extra: supplier.contact_person || supplier.phone || null
  }))
)

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const mergeSuppliers = (suppliers: any[]) => {
  const next = [...supplierList.value]
  suppliers.forEach((supplier: any) => {
    if (!supplier?.id) return
    const index = next.findIndex((item: any) => item.id === supplier.id)
    if (index >= 0) next[index] = { ...next[index], ...supplier }
    else next.push(supplier)
  })
  supplierList.value = next
}

const fetchSuppliers = async (query = '') => {
  loading.value = true
  try {
    const res: any = await supplierAPI.getList({ search: query, page_size: 50, status: 'active' })
    supplierList.value = res?.results || res || []
    if (!query) cacheTimestamp = Date.now()
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    loading.value = false
  }
}

const searchSuppliers = (query = '') => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    const trimmed = query.trim()
    const now = Date.now()
    if (!trimmed && supplierList.value.length > 0 && now - cacheTimestamp < CACHE_DURATION) return
    fetchSuppliers(trimmed)
  }, 300)
}

fetchSuppliers()

watch(() => props.suppliers, (suppliers) => mergeSuppliers(suppliers as any[]), { immediate: true, deep: true })

watch(
  () => props.modelValue,
  async (id) => {
    if (!id) return
    const exists = supplierList.value.some((supplier: any) => supplier.id === id)
    if (exists) return
    try {
      const res: any = await supplierAPI.getDetail(id)
      if (res?.id) mergeSuppliers([res])
    } catch (error: any) {
      ErrorHandler.handle(error)
    }
  },
  { immediate: true }
)

const handleCreate = (query: string) => {
  emit('create', query)
}

const appendSupplier = (supplier: any) => {
  mergeSuppliers([supplier])
}

defineExpose({ appendSupplier })
</script>
