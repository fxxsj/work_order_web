<template>
  <Select
    :model-value="modelValue"
    :options="productOptions"
    placeholder="请选择产品"
    filterable
    :loading="loading"
    :disabled="disabled"
    :clearable="clearable"
    @update:model-value="v => emit('update:modelValue', v)"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Select } from '@/components/common'
import { productAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ modelValue: { type: Number, default: null }, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true } })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const productList = ref<any[]>([])

const productOptions = computed(() => productList.value.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})`, extra: p.unit_price ? `¥${p.unit_price}` : null })))

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const fetchProducts = async (query = '') => {
  loading.value = true
  try {
    const res: any = await productAPI.getList({ search: query, page_size: 50 })
    productList.value = res?.results || res || []
    if (!query) cacheTimestamp = Date.now()
  } catch (error: any) { ErrorHandler.handle(error) } finally { loading.value = false }
}

const searchProducts = (query = '') => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    const trimmed = query.trim()
    const now = Date.now()
    if (!trimmed && productList.value.length > 0 && now - cacheTimestamp < CACHE_DURATION) return
    fetchProducts(trimmed)
  }, 300)
}

fetchProducts()

watch(() => props.modelValue, async (id) => {
  if (!id) return
  const exists = productList.value.some((p) => p.id === id)
  if (exists) return
  try {
    const res: any = await productAPI.getDetail(id)
    if (res && res.id) productList.value = [...productList.value, res]
  } catch (error: any) { ErrorHandler.handle(error) }
}, { immediate: true })

const appendProduct = (product: any) => {
  if (!product || !product.id) return
  const exists = productList.value.some((p) => p.id === product.id)
  if (!exists) productList.value = [...productList.value, product]
}

defineExpose({ appendProduct })
</script>
