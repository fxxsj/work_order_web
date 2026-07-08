<template>
  <SupplierFormDialog
    :visible="dialogVisible"
    dialog-type="create"
    :loading="loading"
    @update:visible="dialogVisible = $event"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { supplierAPI } from '@/api/modules'
import SupplierFormDialog from '@/views/supplier/components/SupplierFormDialog.vue'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:visible', val)
  }
})

const handleConfirm = async (payload: any) => {
  loading.value = true
  try {
    const created: any = await supplierAPI.create(payload)
    useUIStore().showSuccess('供应商创建成功')
    emit('created', created)
    dialogVisible.value = false
  } catch (error: any) {
    ErrorHandler.showMessage(error, '创建供应商失败')
  } finally {
    loading.value = false
  }
}
</script>
