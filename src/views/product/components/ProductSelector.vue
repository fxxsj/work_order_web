<template>
  <Select
    :model-value="modelValue"
    :options="productOptions"
    placeholder="请选择产品"
    filterable
    remote
    :remote-method="searchProducts"
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
import { productAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  modelValue: { type: Number, default: null },
  products: { type: Array as any, default: () => [] },
  customerId: { type: [Number, String], default: null },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'create'])

const loading = ref(false)
const productList = ref<any[]>([])

const productOptions = computed(() =>
  productList.value.map((p: any) => ({
    value: p.id,
    label: `${p.name} (${p.code || '无编码'})`,
    extra: p.unit_price ? `¥${p.unit_price}` : null
  }))
)

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const mergeProducts = (products: any[]) => {
  const next = [...productList.value]
  products.forEach((product: any) => {
    if (!product?.id) return
    const index = next.findIndex((item: any) => item.id === product.id)
    if (index >= 0) next[index] = { ...next[index], ...product }
    else next.push(product)
  })
  productList.value = next
}

const fetchProducts = async (query = '') => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      search: query,
      page_size: 50,
      is_active: true
    }
    if (props.customerId) params.customer = props.customerId
    const res: any = await productAPI.getList(params)
    productList.value = res?.results || res || []
    if (!query) cacheTimestamp = Date.now()
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    loading.value = false
  }
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

watch(() => props.products, (products) => mergeProducts(products as any[]), { immediate: true, deep: true })

watch(
  () => props.customerId,
  () => {
    productList.value = []
    cacheTimestamp = 0
    fetchProducts()
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  async (id) => {
    if (!id) return
    const exists = productList.value.some((p: any) => p.id === id)
    if (exists) return
    try {
      const res: any = await productAPI.getDetail(id)
      if (res?.id) mergeProducts([res])
    } catch (error: any) {
      ErrorHandler.handle(error)
    }
  },
  { immediate: true }
)

const handleCreate = (query: string) => {
  emit('create', query)
}

const appendProduct = (product: any) => {
  mergeProducts([product])
}

defineExpose({ appendProduct })
</script>
