<template>
  <PlateFormDialog
    ref="plateFormRef"
    v-model="dialogVisibleSync"
    :dialog-type="dialogType"
    :initial-data="initialData"
    :loading="loading"
    :product-list="productList"
    title="刀模"
    code-prefix="DIE"
    :form-initial-values="FORM_INITIAL_VALUES"
    :extra-fields="extraFieldsConfig"
    :rules="rules"
    quantity-column-label="拼版个数"
    :can-add-more="canAddMoreProducts"
    :product-list-hint-text="productListHint"
    @submit="handleSubmit"
    @close="handleClose"
    @field-change="handleFieldChange"
  />

  <ConfirmDialog
    :show="truncateConfirmVisible"
    title="切换刀模类型"
    message="专用刀模只能关联1个产品，是否只保留第一个产品？"
    confirm-text="确定"
    cancel-text="取消"
    @confirm="handleTruncateConfirm"
    @cancel="handleTruncateCancel"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import PlateFormDialog from '@/views/components/PlateFormDialog.vue'
import { ConfirmDialog } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['submit', 'close', 'update:visible'])

const plateFormRef = ref<any>(null)

const FORM_INITIAL_VALUES = {
  code: '', name: '', die_type: 'dedicated', size: '', material: '', thickness: '', notes: ''
}

const extraFieldsConfig = [
  {
    prop: 'die_type',
    label: '刀模类型',
    type: 'select',
    placeholder: '请选择刀模类型',
    options: [
      { value: 'combined', label: '拼版刀模', description: '多产品同时切割，一次模切产出多种产品' },
      { value: 'dedicated', label: '专用刀模', description: '单产品专用，只能切割一种产品' },
      { value: 'universal', label: '通用刀模', description: '多产品可共用，但每次只切一种产品' }
    ]
  }
]

const rules = {
  name: [{ required: true, message: '请输入刀模名称', trigger: 'blur' }, { max: 200, message: '刀模名称不能超过200个字符', trigger: 'blur' }],
  code: [{ max: 50, message: '编码不能超过50个字符', trigger: 'blur' }],
  die_type: [{ required: true, message: '请选择刀模类型', trigger: 'change' }],
  size: [{ max: 100, message: '尺寸不能超过100个字符', trigger: 'blur' }],
  material: [{ max: 100, message: '材质不能超过100个字符', trigger: 'blur' }],
  thickness: [{ max: 50, message: '厚度不能超过50个字符', trigger: 'blur' }]
}

// Track die_type from PlateFormDialog's form for reactive canAddMoreProducts / productListHint
const currentDieType = ref('dedicated')
const truncateConfirmVisible = ref(false)

const dialogVisibleSync = computed({
  get: () => props.visible,
  set: (val: any) => emit('update:visible', val)
})

const canAddMoreProducts = computed(() => currentDieType.value !== 'dedicated')
const productListHint = computed(() => ({
  combined: '拼版刀模：可添加多个产品',
  dedicated: '专用刀模：只能添加1个产品',
  universal: '通用刀模：可添加多个产品'
}[currentDieType.value] || ''))

// Sync die_type when dialog opens
watch(() => props.visible, (val: any) => {
  if (val) {
    currentDieType.value = (props.dialogType === 'edit' && props.initialData?.die_type) || 'dedicated'
  }
})

// Handle field changes from PlateFormDialog
const handleFieldChange = (extraData: any) => {
  if (extraData.die_type !== undefined) {
    const newType = extraData.die_type
    currentDieType.value = newType

    // When switching to dedicated and >1 product items exist, confirm truncation
    if (newType === 'dedicated' && plateFormRef.value) {
      const items = plateFormRef.value.productItems
      if (items.length > 1) {
        truncateConfirmVisible.value = true
      }
    }
  }
}

const handleTruncateConfirm = () => {
  truncateConfirmVisible.value = false
  if (plateFormRef.value) {
    plateFormRef.value.productItems.splice(1)
  }
}

const handleTruncateCancel = () => {
  truncateConfirmVisible.value = false
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = (data: any) => {
  // DieFormDialog adds relation_type to products_data based on die_type
  const relationTypeByDieType = data.die_type === 'combined' ? 'imposition' : 'exclusive'
  data.products_data = data.products_data.map((item: any) => ({
    ...item,
    relation_type: relationTypeByDieType
  }))

  emit('submit', data)
}
</script>
