<template>
  <PlateFormDialog
    v-model:visible="dialogVisibleSync"
    :dialog-type="dialogType"
    :initial-data="embossingPlate"
    :loading="loading"
    :product-list="productList"
    title="压凸版"
    code-prefix="EP"
    :form-initial-values="FORM_INITIAL"
    :rules="rules"
    :image-api="embossingPlateAPI"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlateFormDialog from '@/views/components/PlateFormDialog.vue'
import { embossingPlateAPI } from '@/api/modules'

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
  emit('confirm', data)
}
</script>
