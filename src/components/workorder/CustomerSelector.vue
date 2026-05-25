<template>
  <div class="w-full">
    <label class="input-label mb-1.5 block">
      客户<span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="flex items-center gap-2">
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
        class="flex-1"
        @update:model-value="v => emit('update:modelValue', v)"
      />
      <button
        v-if="!disabled"
        class="btn btn-secondary"
        type="button"
        @click="emit('create')"
      >
        <Icon
          name="plus"
          size="sm"
          class="mr-1"
        />
        新建
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Select, Icon } from '@/components/common'
import { customerAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  modelValue: { type: Number, default: null },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true },
  required: { type: Boolean, default: false }
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

const searchCustomers = async (query = '') => {
  const now = Date.now()
  if (customerList.value.length === 0 || now - cacheTimestamp > CACHE_DURATION || query) {
    loading.value = true
    try {
      const res: any = await customerAPI.getList({ search: query, page_size: 100 })
      customerList.value = res?.results || res || []
      cacheTimestamp = now
    } catch (error: any) {
      ErrorHandler.handle(error)
    } finally {
      loading.value = false
    }
  }
}

searchCustomers()
</script>
