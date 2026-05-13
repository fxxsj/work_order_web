<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="烫金版编码" prop="code">
        <el-input v-model="form.code" placeholder="留空则系统自动生成（格式：FP + yyyymm + 序号）" :disabled="isConfirmed" />
        <div style="font-size: 12px; color: #909399; margin-top: 5px;">留空则自动生成，格式：FP202412001</div>
      </el-form-item>
      <el-form-item label="烫金版名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入烫金版名称" :disabled="isConfirmed" />
      </el-form-item>
      <el-form-item label="类型" prop="foiling_type">
        <el-select v-model="form.foiling_type" placeholder="请选择类型" style="width: 100%;">
          <el-option label="烫金" value="gold" />
          <el-option label="烫银" value="silver" />
        </el-select>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item label="尺寸"><el-input v-model="form.size" placeholder="如：420x594mm" :disabled="isConfirmed" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="材质"><el-input v-model="form.material" placeholder="如：铜版、锌版" :disabled="isConfirmed" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="厚度"><el-input v-model="form.thickness" placeholder="如：3mm、5mm" :disabled="isConfirmed" /></el-form-item>

      <el-divider content-position="left">包含产品及数量</el-divider>
      <el-form-item label="产品列表">
        <el-button type="primary" size="small" :icon="Plus" @click="addProductItem">添加产品</el-button>
        <el-table :data="productItems" border style="width: 100%; margin-top: 15px;">
          <el-table-column label="产品名称" width="250">
            <template #default="scope">
              <el-select v-model="scope.row.product" placeholder="请选择产品" filterable style="width: 100%;">
                <el-option v-for="p in productList" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="150">
            <template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" style="width: 100%;" size="small" /></template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope"><el-button type="danger" size="small" :icon="Delete" @click="removeProductItem(scope.$index)" /></template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注信息" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  foilingPlate: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)
const productItems = ref([])

const FORM_INITIAL = { code: '', name: '', foiling_type: 'gold', size: '', material: '', thickness: '', notes: '' }
const form = reactive({ ...FORM_INITIAL })

const rules = { name: [{ required: true, message: '请输入烫金版名称', trigger: 'blur' }] }

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => props.dialogType === 'edit' ? '编辑烫金版' : '新建烫金版')
const isConfirmed = computed(() => props.dialogType === 'edit' && props.foilingPlate?.confirmed)

watch(() => props.visible, (val) => { if (val) initForm() })

const initForm = () => {
  if (props.dialogType === 'edit' && props.foilingPlate) {
    Object.assign(form, {
      code: props.foilingPlate.code,
      name: props.foilingPlate.name,
      foiling_type: props.foilingPlate.foiling_type || 'gold',
      size: props.foilingPlate.size || '',
      material: props.foilingPlate.material || '',
      thickness: props.foilingPlate.thickness || '',
      notes: props.foilingPlate.notes || ''
    })
    productItems.value = (props.foilingPlate.products || []).map(p => ({ id: p.id, product: p.product, quantity: p.quantity, sort_order: p.sort_order || 0 }))
  } else {
    resetForm()
  }
  nextTick(() => { formRef.value?.clearValidate() })
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  productItems.value = []
  nextTick(() => { formRef.value?.clearValidate() })
}

const handleConfirm = () => {
  formRef.value?.validate((valid) => {
    if (valid) emit('confirm', { form: { ...form }, productItems: [...productItems.value] })
  })
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
const addProductItem = () => { productItems.value.push({ product: null, quantity: 1, sort_order: productItems.value.length }) }
const removeProductItem = (index) => { productItems.value.splice(index, 1) }
</script>
