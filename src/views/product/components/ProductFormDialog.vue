<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="产品编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入产品编码" :disabled="isEditMode" />
      </el-form-item>
      <el-form-item label="产品名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入产品名称" />
      </el-form-item>
      <el-form-item label="产品类型" prop="product_type">
        <el-select v-model="form.product_type" placeholder="请选择产品类型" style="width: 100%;" @change="handleProductTypeChange">
          <el-option label="单品" value="single">
            <span>单品</span><span style="color: #909399; font-size: 12px; margin-left: 8px;">独立产品，可单独销售</span>
          </el-option>
          <el-option label="套装主产品" value="group_main">
            <span>套装主产品</span><span style="color: #909399; font-size: 12px; margin-left: 8px;">用于销售下单</span>
          </el-option>
          <el-option label="套装子产品" value="group_item">
            <span>套装子产品</span><span style="color: #909399; font-size: 12px; margin-left: 8px;">用于生产制造</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="form.product_type !== 'single'" label="所属产品组" :prop="form.product_type !== 'single' ? 'product_group' : ''" :rules="form.product_type !== 'single' ? [{ required: true, message: '请选择产品组', trigger: 'change' }] : []">
        <el-select v-model="form.product_group" placeholder="请选择产品组" filterable style="width: 100%;">
          <el-option v-for="group in productGroups" :key="group.id" :label="`${group.code} - ${group.name}`" :value="group.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="规格" prop="specification"><el-input v-model="form.specification" placeholder="请输入产品规格" /></el-form-item>
      <el-form-item label="单位" prop="unit"><el-input v-model="form.unit" placeholder="如：件，张、本" /></el-form-item>
      <el-form-item label="单价" prop="unit_price"><el-input-number v-model="form.unit_price" :min="0" :precision="2" style="width: 100%;" /></el-form-item>
      <el-form-item label="库存数量"><el-input-number v-model="form.stock_quantity" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item label="最小库存"><el-input-number v-model="form.min_stock_quantity" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item label="产品描述"><el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入产品描述" /></el-form-item>

      <el-divider content-position="left">默认物料配置</el-divider>
      <el-form-item label="物料列表">
        <el-button type="primary" size="small" :icon="Plus" @click="addMaterialItem">添加物料</el-button>
        <el-table :data="materialItems" border style="width: 100%; margin-top: 15px;">
          <el-table-column label="物料名称" width="200">
            <template #default="scope">
              <el-select v-model="scope.row.material" placeholder="请选择物料" filterable style="width: 100%;">
                <el-option v-for="m in materials" :key="m.id" :label="`${m.name} (${m.code})`" :value="m.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="尺寸" width="150">
            <template #default="scope"><el-input v-model="scope.row.material_size" placeholder="如：A4、210x297mm" size="small" /></template>
          </el-table-column>
          <el-table-column label="用量" width="150">
            <template #default="scope"><el-input v-model="scope.row.material_usage" placeholder="如：1000张" size="small" /></template>
          </el-table-column>
          <el-table-column label="需要开料" width="80" align="center">
            <template #default="scope"><el-switch v-model="scope.row.need_cutting" size="small" /></template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope"><el-button type="danger" size="small" :icon="Delete" @click="removeMaterialItem(scope.$index)" /></template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-divider content-position="left">默认工序配置</el-divider>
      <el-form-item label="默认工序">
        <el-checkbox-group v-model="form.default_processes" style="width: 100%;">
          <el-checkbox v-for="p in processes" :key="p.id" :label="p.id" :disabled="!p.is_active">{{ p.name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="是否启用"><el-switch v-model="form.is_active" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
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
  product: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  materials: { type: Array, default: () => [] },
  processes: { type: Array, default: () => [] },
  productGroups: { type: Array, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const materialItems = ref([])

const FORM_INITIAL = {
  code: '', name: '', product_type: 'single', product_group: null, specification: '', unit: '件',
  unit_price: 0, stock_quantity: 0, min_stock_quantity: 0, description: '', is_active: true, default_processes: []
}

const form = reactive({ ...FORM_INITIAL })

const rules = {
  code: [{ required: true, message: '请输入产品编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
  specification: [{ required: true, message: '请输入产品规格', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }],
  unit_price: [{ required: true, message: '请输入单价', trigger: 'blur' }]
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => props.dialogType === 'edit' ? '编辑产品' : '新建产品')
const isEditMode = computed(() => props.dialogType === 'edit')

watch(() => props.visible, (val) => {
  if (val) {
    if (props.dialogType === 'edit' && props.product) {
      initFormFromProduct()
    } else {
      resetForm()
    }
  }
})

const initFormFromProduct = () => {
  if (!props.product) return
  Object.assign(form, {
    code: props.product.code || '',
    name: props.product.name || '',
    product_type: props.product.product_type || 'single',
    product_group: props.product.product_group || null,
    specification: props.product.specification || '',
    unit: props.product.unit || '件',
    unit_price: parseFloat(props.product.unit_price) || 0,
    stock_quantity: props.product.stock_quantity || 0,
    min_stock_quantity: props.product.min_stock_quantity || 0,
    description: props.product.description || '',
    is_active: props.product.is_active !== false,
    default_processes: props.product.default_processes || []
  })
  materialItems.value = (props.product.default_materials || []).map(m => ({
    id: m.id, material: m.material, material_size: m.material_size || '', material_usage: m.material_usage || '', need_cutting: m.need_cutting || false, notes: m.notes || '', sort_order: m.sort_order || 0
  }))
  nextTick(() => { formRef.value?.clearValidate() })
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  materialItems.value = []
  nextTick(() => { formRef.value?.clearValidate() })
}

const handleProductTypeChange = (value) => { if (value === 'single') form.product_group = null }
const addMaterialItem = () => { materialItems.value.push({ material: null, material_size: '', material_usage: '', need_cutting: false, notes: '', sort_order: materialItems.value.length }) }
const removeMaterialItem = (index) => { materialItems.value.splice(index, 1) }
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) emit('confirm', { form: { ...form }, materialItems: [...materialItems.value] })
  })
}
const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>

<style scoped>
.el-divider { margin: 20px 0; }
</style>
