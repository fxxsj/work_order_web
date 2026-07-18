<template>
  <BaseDialog
    :show="isOpen"
    :title="dialogTitle"
    width="normal"
    @close="handleClose"
  >
    <form
      id="material-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <Input
        v-model="form.code"
        label="物料编码"
        placeholder="请输入编码（留空自动生成）"
        :disabled="isEditMode"
      />
      <Input
        v-model="form.name"
        label="物料名称"
        required
        placeholder="请输入物料名称"
      />
      <Input
        v-model="form.specification"
        label="规格"
        placeholder="请输入规格"
      />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          v-model="form.specification_level"
          label="规格层级"
          :options="specificationLevelOptions"
        />
        <Select
          v-model="form.material_type"
          label="物料类型"
          :options="materialTypeOptions"
        />
      </div>
      <template v-if="form.material_type === 'paper'">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            v-model="form.paper_type"
            label="纸张品种"
            placeholder="如：双铜、双胶、白卡"
          />
          <InputNumber
            :model-value="form.grammage ?? undefined"
            label="克重（g/㎡）"
            :min="0"
            :precision="2"
            @update:model-value="form.grammage = $event"
          />
        </div>
        <div
          v-if="form.specification_level === 'stock'"
          class="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <InputNumber
            :model-value="form.sheet_width_mm ?? undefined"
            label="原纸宽度（mm）"
            :min="0"
            :precision="2"
            @update:model-value="form.sheet_width_mm = $event"
          />
          <InputNumber
            :model-value="form.sheet_height_mm ?? undefined"
            label="原纸高度（mm）"
            :min="0"
            :precision="2"
            @update:model-value="form.sheet_height_mm = $event"
          />
          <Select
            v-model="form.grain_direction"
            label="纹向"
            :options="grainDirectionOptions"
          />
        </div>
        <Select
          v-if="form.specification_level === 'stock'"
          v-model="form.base_material"
          label="对应材料要求"
          placeholder="请选择产品 BOM 中的材料要求"
          :options="requirementOptions"
          filterable
          clearable
        />
      </template>
      <Input
        v-model="form.unit"
        label="单位"
        required
        placeholder="如：个、张、本"
      />
      <InputNumber
        v-model="form.unit_price"
        label="单价"
        :min="0"
        :step="0.01"
        :precision="2"
      />
      <InputNumber
        v-model="form.stock_quantity"
        label="库存数量"
        :min="0"
      />
      <InputNumber
        v-model="form.min_stock_quantity"
        label="最小库存"
        :min="0"
      />
      <InputNumber
        v-model="form.lead_time_days"
        label="采购周期（天）"
        :min="0"
      />
      <Toggle
        v-model="form.need_cutting"
        label="需要开料"
      />
      <Select
        v-model="form.default_supplier"
        label="默认供应商"
        placeholder="请选择供应商"
        :options="supplierOptions"
        filterable
        clearable
      />
      <TextArea
        v-model="form.notes"
        label="备注"
        placeholder="请输入备注"
        :rows="3"
      />
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleClose"
        >
          取消
        </button>
        <BaseButton
          form="material-form"
          type="submit"
          variant="primary"
          :loading="loading"
        >
          {{ isEditMode ? '更新' : '创建' }}
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { BaseButton, BaseDialog, Input, InputNumber, Select, TextArea, Toggle } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

type MaterialForm = {
  code: string
  name: string
  specification: string
  specification_level: string
  material_type: string
  paper_type: string
  grammage: number | null
  sheet_width_mm: number | null
  sheet_height_mm: number | null
  grain_direction: string
  base_material: number | null
  unit: string
  unit_price: number
  stock_quantity: number
  min_stock_quantity: number
  lead_time_days: number
  need_cutting: boolean
  default_supplier: number | null
  notes: string
}

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  material: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  supplierOptions: { type: Array as any, default: () => [] },
  requirementOptions: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formInitialValues: MaterialForm = {
  code: '',
  name: '',
  specification: '',
  specification_level: 'stock',
  material_type: 'other',
  paper_type: '',
  grammage: null,
  sheet_width_mm: null,
  sheet_height_mm: null,
  grain_direction: '',
  base_material: null,
  unit: '个',
  unit_price: 0,
  stock_quantity: 0,
  min_stock_quantity: 0,
  lead_time_days: 7,
  need_cutting: false,
  default_supplier: null,
  notes: ''
}
const form = reactive({ ...formInitialValues })
const isOpen = ref(false)

const isEditMode = computed(() => props.dialogType === 'edit')
const dialogTitle = computed(() => isEditMode.value ? '编辑物料' : '新建物料')
const specificationLevelOptions = [
  { value: 'requirement', label: '材料要求（产品BOM）' },
  { value: 'stock', label: '库存/采购规格' }
]
const materialTypeOptions = [
  { value: 'paper', label: '纸张' },
  { value: 'ink', label: '油墨' },
  { value: 'film', label: '覆膜' },
  { value: 'foil', label: '烫印料' },
  { value: 'adhesive', label: '胶黏剂' },
  { value: 'packing', label: '包装辅料' },
  { value: 'other', label: '其他' }
]
const grainDirectionOptions = [
  { value: '', label: '未指定' },
  { value: 'long', label: '长纹' },
  { value: 'short', label: '短纹' }
]

watch(() => props.visible, (val) => {
  isOpen.value = val
  if (val) {
    if (isEditMode.value && props.material) initFormFromMaterial()
    else resetForm()
  }
}, { immediate: true })

const initFormFromMaterial = () => {
  Object.assign(form, {
    code: props.material?.code || '',
    name: props.material?.name || '',
    specification: props.material?.specification || '',
    specification_level: props.material?.specification_level || 'stock',
    material_type: props.material?.material_type || 'other',
    paper_type: props.material?.paper_type || '',
    grammage: props.material?.grammage == null ? null : Number(props.material.grammage),
    sheet_width_mm: props.material?.sheet_width_mm == null ? null : Number(props.material.sheet_width_mm),
    sheet_height_mm: props.material?.sheet_height_mm == null ? null : Number(props.material.sheet_height_mm),
    grain_direction: props.material?.grain_direction || '',
    base_material: props.material?.base_material || null,
    unit: props.material?.unit || '个',
    unit_price: Number(props.material?.unit_price || 0),
    stock_quantity: Number(props.material?.stock_quantity || 0),
    min_stock_quantity: Number(props.material?.min_stock_quantity || 0),
    lead_time_days: Number(props.material?.lead_time_days ?? 7),
    need_cutting: !!props.material?.need_cutting,
    default_supplier: props.material?.default_supplier || null,
    notes: props.material?.notes || ''
  })
}

const resetForm = () => { Object.assign(form, formInitialValues) }

const handleSubmit = () => {
  const trimmedCode = form.code.trim()
  const trimmedName = form.name.trim()
  const trimmedUnit = form.unit.trim()

  if (!trimmedName || !trimmedUnit) {
    ErrorHandler.showWarning('请填写必填项(名称、单位)')
    return
  }
  if (trimmedCode) {
    if (trimmedCode.length < 2 || trimmedCode.length > 50) {
      ErrorHandler.showWarning('物料编码长度应在 2-50 个字符之间')
      return
    }
    if (!/^[A-Za-z0-9-]+$/.test(trimmedCode)) {
      ErrorHandler.showWarning('物料编码只能包含字母、数字和连字符')
      return
    }
  }
  if (isEditMode.value && form.min_stock_quantity > form.stock_quantity) {
    ErrorHandler.showWarning('最小库存不能大于当前库存')
    return
  }
  if (form.specification_level === 'stock' && form.material_type === 'paper' && !form.base_material) {
    ErrorHandler.showWarning('库存/采购纸张必须选择对应的材料要求')
    return
  }

  emit('confirm', {
    ...form,
    code: trimmedCode,
    name: trimmedName,
    unit: trimmedUnit,
    base_material: form.specification_level === 'stock' ? form.base_material : null
  })
}

const handleClose = () => {
  resetForm()
  emit('update:visible', false)
}
</script>
