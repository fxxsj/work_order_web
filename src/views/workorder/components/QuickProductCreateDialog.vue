<template>
  <ProductFormDialog
    :visible="dialogVisible"
    dialog-type="create"
    :loading="loading"
    :materials="materialList"
    :processes="processList"
    :product-groups="productGroupList"
    :customers="customerList"
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
  visible: { type: Boolean, default: false },
  // 预设客户：从销售订单/施工单快速创建产品时自动带入当前客户
  presetCustomerId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const {
  materialList,
  processList,
  productGroupList,
  customerList,
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
    // 快速创建时自动带入当前订单/施工单的客户（若未显式指定所属客户）
    if (props.presetCustomerId && (!payload.form.customer_ids || payload.form.customer_ids.length === 0)) {
      payload.form.customer_ids = [props.presetCustomerId]
    }
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
