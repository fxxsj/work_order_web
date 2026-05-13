<template>
  <el-select :model-value="modelValue" placeholder="请选择产品" filterable remote :remote-method="searchProducts" :loading="loading" :disabled="disabled" style="width: 100%;" reserve-keyword :clearable="clearable" @update:model-value="v => emit('update:modelValue', v)">
    <el-option v-for="p in productList" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id"><span>{{ p.name }}</span><span style="float: right; color: #8492a6; font-size: 13px">¥{{ p.unit_price }}</span></el-option>
  </el-select>
</template>

<script setup>
import { ref } from 'vue'
import { productAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ modelValue: { type: Number, default: null }, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true } })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const productList = ref([])

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000

const searchProducts = async (query = '') => {
  const now = Date.now()
  if (productList.value.length === 0 || now - cacheTimestamp > CACHE_DURATION || query) {
    loading.value = true
    try { const res = await productAPI.getList({ search: query, page_size: 100 }); productList.value = res?.results || res || []; cacheTimestamp = now } catch (error) { ErrorHandler.handle(error) } finally { loading.value = false }
  }
}

searchProducts()
</script>
