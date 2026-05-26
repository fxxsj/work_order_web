<template>
  <div class="w-full">
    <label
      v-if="label"
      class="input-label mb-1.5 block"
    >
      {{ label }}<span v-if="required" class="text-red-500">*</span>
    </label>
    <Select
      :model-value="modelValue"
      placeholder="请选择客户"
      :options="customerOptions"
      filterable
      remote
      :remote-method="searchCustomers"
      :loading="loading"
      :disabled="disabled"
      :clearable="clearable"
      creatable
      class="w-full"
      @update:model-value="v => emit('update:modelValue', v)"
      @create="handleCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Select } from '@/components/common'
import { customerAPI } from '@/api/modules/customer'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  modelValue: { type: Number, default: null },
  customers: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  required: { type: Boolean, default: false },
  label: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'create'])

const loading = ref(false)
const customerList = ref<any[]>([])

const customerOptions = computed(() =>
  customerList.value.map((c: any) => ({
    value: c.id,
    label: c.name,
    extra: c.contact_person ? { label: c.contact_person, align: 'right' } : null
  }))
)

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const mergeCustomers = (customers: any[]) => {
  const next = [...customerList.value]
  customers.forEach((customer: any) => {
    if (!customer?.id) return
    const index = next.findIndex((item: any) => item.id === customer.id)
    if (index >= 0) next[index] = { ...next[index], ...customer }
    else next.push(customer)
  })
  customerList.value = next
}

const fetchCustomers = async (query = '') => {
  loading.value = true
  try {
    const res: any = await customerAPI.getList({ search: query, page_size: 50 })
    customerList.value = res?.results || res || []
    if (!query) cacheTimestamp = Date.now()
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    loading.value = false
  }
}

const searchCustomers = (query = '') => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    const trimmed = query.trim()
    const now = Date.now()
    if (!trimmed && customerList.value.length > 0 && now - cacheTimestamp < CACHE_DURATION) return
    fetchCustomers(trimmed)
  }, 300)
}

fetchCustomers()

watch(() => props.customers, (customers) => mergeCustomers(customers as any[]), { immediate: true, deep: true })

watch(
  () => props.modelValue,
  async (id) => {
    if (!id) return
    const exists = customerList.value.some((c: any) => c.id === id)
    if (exists) return
    try {
      const res: any = await customerAPI.getDetail(id)
      if (res?.id) mergeCustomers([res])
    } catch (error: any) {
      ErrorHandler.handle(error)
    }
  },
  { immediate: true }
)

const handleCreate = (query: string) => {
  emit('create', query)
}

const appendCustomer = (customer: any) => {
  mergeCustomers([customer])
}

defineExpose({ appendCustomer })
</script>
