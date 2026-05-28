<template>
  <PlateFormDialog
    v-model:visible="dialogVisibleSync"
    :dialog-type="dialogType"
    :initial-data="foilingPlate"
    :loading="loading"
    :product-list="productList"
    title="烫金版"
    code-prefix="FP"
    :form-initial-values="FORM_INITIAL"
    :extra-fields="extraFieldsConfig"
    :rules="rules"
    :image-api="foilingPlateAPI"
    @submit="handleSubmit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PlateFormDialog from '@/views/components/PlateFormDialog.vue'
import { foilingPlateAPI } from '@/api/modules'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  foilingPlate: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const FORM_INITIAL = { code: '', name: '', foiling_type: 'gold', size: '', material: '', thickness: '', notes: '' }

const extraFieldsConfig = [
  {
    prop: 'foiling_type',
    label: '类型',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      { value: 'gold', label: '烫金' },
      { value: 'silver', label: '烫银' }
    ]
  }
]

const rules = { name: [{ required: true, message: '请输入烫金版名称', trigger: 'blur' }] }

const dialogVisibleSync = computed({
  get: () => props.visible,
  set: (val: any) => emit('update:visible', val)
})

const handleSubmit = (data: any) => {
  emit('confirm', data)
}
</script>
