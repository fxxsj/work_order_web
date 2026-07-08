<template>
  <ProductFormDialog
    :visible="dialogVisible"
    dialog-type="create"
    :loading="loading"
    :materials="materialList"
    :processes="processList"
    :product-groups="productGroupList"
    @update:visible="dialogVisible = $event"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import ProductFormDialog from '@/views/product/components/ProductFormDialog.vue'
import { useProductFormSupportData, useProductFormWorkflow } from '@/views/product/composables/useProductFormWorkflow'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const {
  materialList,
  processList,
  productGroupList,
  loadSupportData
} = useProductFormSupportData()
const {
  saving: loading,
  createProduct
} = useProductFormWorkflow()

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:visible', val)
  }
})

watch(dialogVisible, (visible) => {
  if (visible) loadSupportData()
}, { immediate: true })

const handleConfirm = async (payload: any) => {
  try {
    const created = await createProduct(payload, {
      successMessage: '产品创建成功',
      imageFailureMessage: '产品已创建，部分图片上传失败，请进入产品管理编辑页重试'
    })
    emit('created', created)
    dialogVisible.value = false
  } catch (error: any) {
    ErrorHandler.showMessage(error, '创建产品失败')
  }
}
</script>
