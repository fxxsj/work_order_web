<template>
  <Select
    :model-value="modelValue"
    :options="materialOptions"
    placeholder="请选择物料"
    filterable
    remote
    :remote-method="searchMaterials"
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
import { materialAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  modelValue: { type: Number, default: null },
  materials: { type: Array as any, default: () => [] },
  disabled: { type: Boolean, default: false },
  clearable: { type: Boolean, default: true }
})

const emit = defineEmits(['update:modelValue', 'create'])

const loading = ref(false)
const materialList = ref<any[]>([])

const materialOptions = computed(() =>
  materialList.value.map((m: any) => ({
    value: m.id,
    label: `${m.name} (${m.code || '无编码'})`,
    extra: m.specification || m.unit || null
  }))
)

let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const mergeMaterials = (materials: any[]) => {
  const next = [...materialList.value]
  materials.forEach((material: any) => {
    if (!material?.id) return
    const index = next.findIndex((item: any) => item.id === material.id)
    if (index >= 0) {
      next[index] = { ...next[index], ...material }
    } else {
      next.push(material)
    }
  })
  materialList.value = next
}

const fetchMaterials = async (query = '') => {
  loading.value = true
  try {
    const res: any = await materialAPI.getList({ search: query, page_size: 50 })
    const list = res?.results || res || []
    materialList.value = list
    if (!query) cacheTimestamp = Date.now()
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    loading.value = false
  }
}

const searchMaterials = (query = '') => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    const trimmed = query.trim()
    const now = Date.now()
    if (!trimmed && materialList.value.length > 0 && now - cacheTimestamp < CACHE_DURATION) return
    fetchMaterials(trimmed)
  }, 300)
}

fetchMaterials()

watch(
  () => props.materials,
  (materials) => {
    mergeMaterials(materials as any[])
  },
  { immediate: true, deep: true }
)

watch(
  () => props.modelValue,
  async (id) => {
    if (!id) return
    const exists = materialList.value.some((m: any) => m.id === id)
    if (exists) return
    try {
      const res: any = await materialAPI.getDetail(id)
      if (res?.id) mergeMaterials([res])
    } catch (error: any) {
      ErrorHandler.handle(error)
    }
  },
  { immediate: true }
)

const handleCreate = (query: string) => {
  emit('create', query)
}

const appendMaterial = (material: any) => {
  mergeMaterials([material])
}

defineExpose({ appendMaterial })
</script>
