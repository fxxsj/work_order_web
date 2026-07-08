<template>
  <MaterialFormDialog
    :visible="dialogVisible"
    dialog-type="create"
    :loading="loading"
    :supplier-options="supplierOptions"
    @update:visible="dialogVisible = $event"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { materialAPI, supplierAPI } from '@/api/modules'
import MaterialFormDialog from './MaterialFormDialog.vue'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const loading = ref(false)
const supplierList = ref<any[]>([])

const supplierOptions = computed(() =>
  supplierList.value.map((s: any) => ({ value: s.id, label: `${s.code} - ${s.name}` }))
)

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:visible', val)
  }
})

const loadSuppliers = async () => {
  try {
    const response: any = await supplierAPI.getList({ page_size: 100, status: 'active' })
    supplierList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {
    ErrorHandler.handle(error, 'QuickMaterialCreateDialog.loadSuppliers')
  }
}

const handleConfirm = async (payload: any) => {
  loading.value = true
  try {
    const created: any = await materialAPI.create(payload)
    useUIStore().showSuccess('物料创建成功')
    emit('created', created)
    dialogVisible.value = false
  } catch (error: any) {
    ErrorHandler.showMessage(error, '创建物料失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadSuppliers)
</script>
