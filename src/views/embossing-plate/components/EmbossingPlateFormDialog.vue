<template>
  <PlateFormDialog
    v-model="dialogVisibleSync"
    :dialog-type="dialogType"
    :initial-data="embossingPlate"
    :loading="loading"
    :product-list="productList"
    title="压凸版"
    code-prefix="EP"
    :form-initial-values="FORM_INITIAL"
    :rules="rules"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlateFormDialog from '@/views/components/PlateFormDialog.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  embossingPlate: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const FORM_INITIAL = { code: '', name: '', size: '', material: '', thickness: '', notes: '' }
const rules = { name: [{ required: true, message: '请输入压凸版名称', trigger: 'blur' }] }

const dialogVisibleSync = computed({
  get: () => props.visible,
  set: (val: any) => emit('update:visible', val)
})

const handleSubmit = (data: any) => {
  // PlateFormDialog emits merged data with products_data.
  // Original EmbossingPlateFormDialog emitted { form, productItems } where productItems
  // had { product, quantity, sort_order } objects.
  // Reconstruct to match what EmbossingPlateList.handleFormConfirm expects.
  const { products_data, ...formData } = data
  const productItems = (products_data || []).map((item: any, i: any) => ({
    product: item.product,
    quantity: item.quantity,
    sort_order: i
  }))
  emit('confirm', { form: formData, productItems })
}
</script>
