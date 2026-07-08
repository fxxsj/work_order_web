<template>
  <CustomerFormDialog
    ref="customerFormDialogRef"
    :visible="dialogVisible"
    dialog-type="create"
    :loading="loading"
    :salesperson-options="salespersonOptions"
    @update:visible="dialogVisible = $event"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { authAPI, customerAPI } from '@/api/modules'
import CustomerFormDialog from '@/views/customer/components/CustomerFormDialog.vue'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const loading = ref(false)
const salespersonList = ref<any[]>([])
const customerFormDialogRef = ref<InstanceType<typeof CustomerFormDialog> | null>(null)

const salespersonOptions = computed(() =>
  salespersonList.value.map((u: any) => ({ value: u.id, label: u.username }))
)

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:visible', val)
  }
})

const loadSalespersons = async () => {
  try {
    const response: any = await authAPI.getSalespersons()
    salespersonList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载业务员列表失败')
  }
}

const handleConfirm = async (payload: any) => {
  loading.value = true
  try {
    const created: any = await customerAPI.create(payload)
    useUIStore().showSuccess('客户创建成功')
    emit('created', created)
    dialogVisible.value = false
  } catch (error: any) {
    const errors = error?.response?.data?.errors
    if (errors && typeof errors === 'object' && errors.name) {
      const nameErrors = Array.isArray(errors.name) ? errors.name : [errors.name]
      if (nameErrors.length > 0) {
        customerFormDialogRef.value?.setNameError(nameErrors[0])
        return
      }
    }
    ErrorHandler.showMessage(error, '创建客户失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadSalespersons)
</script>
