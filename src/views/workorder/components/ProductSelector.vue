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
import { ref, computed } from 'vue'
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

const searchProducts = async (query = '') => {
  const now = Date.now()
  if (productList.value.length === 0 || now - cacheTimestamp > CACHE_DURATION || query) {
    loading.value = true
    try { const res: any = await productAPI.getList({ search: query, page_size: 100 }); productList.value = res?.results || res || []; cacheTimestamp = now } catch (error: any) { ErrorHandler.handle(error) } finally { loading.value = false }
  }
}

searchProducts()
</script>
