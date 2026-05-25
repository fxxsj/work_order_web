<template>
  <BaseDialog :show="dialogVisibleSync" :title="dialogTitle" width="wide" @close="handleClose; dialogVisibleSync = false;">
    <div class="space-y-4">
      <Input v-model="form.code" :label="codeLabel" :placeholder="codePlaceholder" :disabled="isConfirmed" />
      <div class="-mt-2 text-xs text-gray-400">{{ codeHint }}</div>
      <Input v-model="form.name" :label="nameLabel" :placeholder="namePlaceholder" :disabled="isConfirmed" />

      <!-- Extra type-specific fields slot -->
      <template v-for="field in extraFields" :key="field.prop">
        <div class="flex items-start gap-3">
          <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">{{ field.label }}</label>
          <div class="flex-1">
            <Select
              v-if="field.type === 'select'"
              v-model="form[field.prop]"
              :options="field.options"
              :placeholder="field.placeholder || '请选择'"
              :disabled="isConfirmed"
              class="w-full"
            />
            <input
              v-else
              type="text"
              v-model="form[field.prop]"
              :placeholder="field.placeholder || ''"
              :disabled="isConfirmed"
              class="input w-full"
            />
          </div>
        </div>
      </template>

      <!-- Extra fields hint slot (for custom hint text below extra fields) -->
      <div v-if="$slots.extraHint" class="-mt-2.5 mb-2.5 pl-0">
        <slot name="extraHint" :form="form" />
      </div>

      <div class="flex flex-wrap gap-5">
        <div class="flex-1 min-w-[300px]"><Input v-model="form.size" label="尺寸" placeholder="如：420x594mm" :disabled="isConfirmed" /></div>
        <div class="flex-1 min-w-[300px]"><Input v-model="form.material" label="材质" placeholder="如：木板、胶板" :disabled="isConfirmed" /></div>
      </div>
      <Input v-model="form.thickness" label="厚度" placeholder="如：3mm、5mm" :disabled="isConfirmed" />

      <SectionDivider title="包含产品及数量" />
      <div class="space-y-2">
        <button class="btn btn-primary btn-sm" :disabled="!canAddMoreProducts" @click="addProductItem"><Icon name="plus" class="mr-1 inline h-3 w-3" />添加产品</button>
        <div v-if="productListHint" class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{{ productListHint }}</div>
        <LineItemsTable
          :columns="productColumns"
          :items="productItems"
          class="mt-3"
          @delete="removeProductItem"
        >
          <template #cell-product="{ row }">
            <Select v-model="row.product" :options="productOptions" placeholder="请选择产品" filterable class="w-full" />
          </template>
          <template #cell-quantity="{ row }">
            <InputNumber v-model="row.quantity" :min="1" class="w-full" />
          </template>
        </LineItemsTable>
      </div>
      <TextArea v-model="form.notes" label="备注" :rows="3" placeholder="请输入备注信息" />
    </div>
    <template #footer>
      <button class="btn" @click="handleCancel">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Icon, Input, TextArea, Select, InputNumber, SectionDivider, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array as any, default: () => [] },
  /** Display name, e.g. "刀模" */
  title: { type: String, required: true },
  /** Code prefix for auto-generation hint, e.g. "DIE" */
  codePrefix: { type: String, required: true },
  /** Initial form values (base fields + any extra fields) */
  formInitialValues: { type: Object, default: () => ({ code: '', name: '', size: '', material: '', thickness: '', notes: '' }) },
  /** Extra field definitions for type-specific fields */
  extraFields: { type: Array as any, default: () => [] },
  /** Validation rules */
  rules: { type: Object, default: () => ({}) },
  /** Column label for quantity in product table */
  quantityColumnLabel: { type: String, default: '数量' },
  /** Whether more products can be added (reactive computed from parent) */
  canAddMore: { type: Boolean, default: true },
  /** Hint text below the add-product button */
  productListHintText: { type: String, default: '' }
})

const emit = defineEmits(['submit', 'close', 'update:visible', 'field-change'])

const formRef = ref<any>(null)
const productItems = ref<any[]>([])

const form = reactive({ ...props.formInitialValues })

const dialogVisibleSync = computed({
  get: () => props.visible,
  set: (val: any) => emit('update:visible', val)
})

const dialogTitle = computed(() => props.dialogType === 'edit' ? `编辑${props.title}` : `新建${props.title}`)
const isConfirmed = computed(() => props.dialogType === 'edit' && props.initialData?.confirmed)
const canAddMoreProducts = computed(() => props.canAddMore)

const codeLabel = computed(() => `${props.title}编码`)
const nameLabel = computed(() => `${props.title}名称`)
const codePlaceholder = computed(() => `留空则系统自动生成（格式：${props.codePrefix} + yyyymm + 序号）`)
const codeHint = computed(() => `留空则自动生成，格式：${props.codePrefix}202412001`)
const namePlaceholder = computed(() => `请输入${props.title}名称`)
const productListHint = computed(() => props.productListHintText)
const productOptions = computed(() => props.productList.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))

const productColumns: Column[] = [
  { key: 'product', label: '产品名称', minWidth: 256 },
  { key: 'quantity', label: props.quantityColumnLabel, width: 144 },
]

watch(() => props.visible, (val: any) => { if (val) initForm() })

// Watch extra fields and emit change events
watch(() => props.extraFields.map((f: any) => form[f.prop]).join('|'), () => {
  const extraData: Record<string, unknown> = {}
  for (const f of props.extraFields) {
    extraData[f.prop] = form[f.prop]
  }
  emit('field-change', extraData)
})

const initForm = () => {
  if (props.dialogType === 'edit' && props.initialData) {
    const data: Record<string, unknown> = {}
    for (const key of Object.keys(props.formInitialValues)) {
      data[key] = props.initialData[key] ?? props.formInitialValues[key]
    }
    Object.assign(form, data)
    productItems.value = (props.initialData.products || []).map((p: any) => ({
      id: p.id,
      product: p.product,
      quantity: p.quantity,
      sort_order: p.sort_order || 0
    }))
  } else {
    Object.assign(form, props.formInitialValues)
    productItems.value = []
  }
  nextTick(() => { formRef.value?.clearValidate() })
}

const resetForm = () => {
  Object.assign(form, props.formInitialValues)
  productItems.value = []
  nextTick(() => { formRef.value?.clearValidate() })
}

const addProductItem = () => {
  productItems.value.push({ product: null, quantity: 1, sort_order: productItems.value.length })
}

const removeProductItem = (index: any) => { productItems.value.splice(index, 1) }

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const data = { ...form }
  if (props.dialogType === 'create' && !data.code) delete data.code

  data.products_data = productItems.value
    .filter((item: any) => item.product)
    .map((item: any) => ({ product: item.product, quantity: item.quantity || 1 }))

  emit('submit', data)
}

const handleCancel = () => { emit('update:visible', false) }
const handleClose = () => { resetForm(); emit('close') }

// Expose internal state for parent wrappers that need to react to form changes
defineExpose({ form, productItems })
</script>
