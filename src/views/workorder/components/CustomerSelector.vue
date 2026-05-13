<template>
  <el-form-item label="客户" prop="customer" required>
    <el-select :model-value="modelValue" placeholder="请选择客户" filterable remote :remote-method="searchCustomers" :loading="loading" :disabled="disabled" style="width: 100%;" reserve-keyword :clearable="clearable" @update:model-value="v => emit('update:modelValue', v)">
      <el-option v-for="c in customerList" :key="c.id" :label="c.name" :value="c.id"><span>{{ c.name }}</span><span v-if="c.contact_person" style="float: right; color: #8492a6; font-size: 13px">{{ c.contact_person }}</span></el-option>
    </el-select>
  </el-form-item>
</template>

<script setup>
import { ref } from 'vue'
import { customerAPI } from '@/api/modules/customer'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({ modelValue: { type: Number, default: null }, disabled: { type: Boolean, default: false }, clearable: { type: Boolean, default: true } })
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const customerList = ref([])

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000

const searchCustomers = async (query = '') => {
  const now = Date.now()
  if (customerList.value.length === 0 || now - cacheTimestamp > CACHE_DURATION || query) {
    loading.value = true
    try { const res = await customerAPI.getList({ search: query, page_size: 100 }); customerList.value = res?.results || res || []; cacheTimestamp = now } catch (error) { ErrorHandler.handle(error) } finally { loading.value = false }
  }
}

searchCustomers()
</script>
