<template>
  <el-dialog v-model="dialogVisibleSync" :title="dialogTitle" width="var(--ui-dialog-width-lg)" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-width="120px">
      <el-form-item :label="codeLabel" prop="code">
        <el-input v-model="form.code" :placeholder="codePlaceholder" :disabled="isConfirmed" />
        <div style="font-size: 12px; color: #909399; margin-top: 5px;">{{ codeHint }}</div>
      </el-form-item>
      <el-form-item :label="nameLabel" prop="name">
        <el-input v-model="form.name" :placeholder="namePlaceholder" :disabled="isConfirmed" />
      </el-form-item>

      <!-- Extra type-specific fields slot -->
      <template v-for="field in extraFields" :key="field.prop">
        <el-form-item :label="field.label" :prop="field.prop">
          <el-select
            v-if="field.type === 'select'"
            v-model="form[field.prop]"
            :placeholder="field.placeholder || '请选择'"
            style="width: 100%;"
            :disabled="isConfirmed"
          >
            <el-option
              v-for="option in field.options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            >
              <span>{{ option.label }}</span>
              <span v-if="option.description" style="float: right; color: #8492a6; font-size: 12px;">{{ option.description }}</span>
            </el-option>
          </el-select>
          <el-input
            v-else
            v-model="form[field.prop]"
            :placeholder="field.placeholder || ''"
            :disabled="isConfirmed"
          />
        </el-form-item>
      </template>

      <!-- Extra fields hint slot (for custom hint text below extra fields) -->
      <div v-if="$slots.extraHint" style="margin-top: -10px; margin-bottom: 10px; padding-left: 0;">
        <slot name="extraHint" :form="form" />
      </div>

      <el-row :gutter="20">
        <el-col :xs="24" :md="12"><el-form-item label="尺寸" prop="size"><el-input v-model="form.size" placeholder="如：420x594mm" :disabled="isConfirmed" /></el-form-item></el-col>
        <el-col :xs="24" :md="12"><el-form-item label="材质" prop="material"><el-input v-model="form.material" placeholder="如：木板、胶板" :disabled="isConfirmed" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="厚度" prop="thickness"><el-input v-model="form.thickness" placeholder="如：3mm、5mm" :disabled="isConfirmed" /></el-form-item>

      <el-divider content-position="left">包含产品及数量</el-divider>
      <el-form-item label="产品列表">
        <el-button type="primary" size="small" :icon="Plus" :disabled="!canAddMoreProducts" @click="addProductItem">添加产品</el-button>
        <div v-if="productListHint" style="font-size: 12px; color: #909399; margin-top: 5px;">{{ productListHint }}</div>
        <div class="table-scroll">
          <el-table :data="productItems" border class="dialog-table">
            <el-table-column label="产品名称" min-width="250">
              <template #default="scope">
                <el-select v-model="scope.row.product" placeholder="请选择产品" filterable style="width: 100%;">
                  <el-option v-for="p in productList" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column :label="quantityColumnLabel" width="150">
              <template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" style="width: 100%;" size="small" /></template>
            </el-table-column>
            <el-table-column label="操作" width="80" align="center">
              <template #default="scope"><el-button type="danger" size="small" :icon="Delete" @click="removeProductItem(scope.$index)" /></template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item label="备注" prop="notes"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array, default: () => [] },
  /** Display name, e.g. "刀模" */
  title: { type: String, required: true },
  /** Code prefix for auto-generation hint, e.g. "DIE" */
  codePrefix: { type: String, required: true },
  /** Initial form values (base fields + any extra fields) */
  formInitialValues: { type: Object, default: () => ({ code: '', name: '', size: '', material: '', thickness: '', notes: '' }) },
  /** Extra field definitions for type-specific fields */
  extraFields: { type: Array, default: () => [] },
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

const formRef = ref(null)
const productItems = ref([])

const form = reactive({ ...props.formInitialValues })

const dialogVisibleSync = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
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

watch(() => props.visible, (val) => { if (val) initForm() })

// Watch extra fields and emit change events
watch(() => props.extraFields.map(f => form[f.prop]).join('|'), () => {
  const extraData = {}
  for (const f of props.extraFields) {
    extraData[f.prop] = form[f.prop]
  }
  emit('field-change', extraData)
})

const initForm = () => {
  if (props.dialogType === 'edit' && props.initialData) {
    const data = {}
    for (const key of Object.keys(props.formInitialValues)) {
      data[key] = props.initialData[key] ?? props.formInitialValues[key]
    }
    Object.assign(form, data)
    productItems.value = (props.initialData.products || []).map(p => ({
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

const removeProductItem = (index) => { productItems.value.splice(index, 1) }

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const data = { ...form }
  if (props.dialogType === 'create' && !data.code) delete data.code

  data.products_data = productItems.value
    .filter(item => item.product)
    .map(item => ({ product: item.product, quantity: item.quantity || 1 }))

  emit('submit', data)
}

const handleCancel = () => { emit('update:visible', false) }
const handleClose = () => { resetForm(); emit('close') }

// Expose internal state for parent wrappers that need to react to form changes
defineExpose({ form, productItems })
</script>

<style scoped>
.table-scroll {
  margin-top: var(--ui-control-gap);
  overflow-x: auto;
}

.dialog-table {
  width: 100%;
}
</style>
