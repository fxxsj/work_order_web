<template>
  <el-dialog v-model="dialogVisibleSync" :title="dialogTitle" width="700px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" v-loading="loading" label-width="120px" :model="form" :rules="rules">
      <el-form-item label="刀模编码" prop="code">
        <el-input v-model="form.code" placeholder="留空则系统自动生成（格式：DIE + yyyymm + 序号）" :disabled="isEdit && initialData?.confirmed" />
        <div style="font-size: 12px; color: #909399; margin-top: 5px;">留空则自动生成，格式：DIE202412001</div>
      </el-form-item>
      <el-form-item label="刀模名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入刀模名称" :disabled="isEdit && initialData?.confirmed" />
      </el-form-item>
      <el-form-item label="刀模类型" prop="die_type">
        <el-select v-model="form.die_type" placeholder="请选择刀模类型" style="width: 100%;" :disabled="isEdit && initialData?.confirmed">
          <el-option v-for="option in dieTypeOptions" :key="option.value" :label="option.label" :value="option.value">
            <span>{{ option.label }}</span><span style="float: right; color: #8492a6; font-size: 12px;">{{ option.description }}</span>
          </el-option>
        </el-select>
        <div style="font-size: 12px; color: #909399; margin-top: 5px;">拼版刀模：多产品同时切割 | 专用刀模：单产品专用 | 通用刀模：多产品可共用</div>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12"><el-form-item label="尺寸" prop="size"><el-input v-model="form.size" placeholder="如：420x594mm" :disabled="isEdit && initialData?.confirmed" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="材质" prop="material"><el-input v-model="form.material" placeholder="如：木板、胶板" :disabled="isEdit && initialData?.confirmed" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="厚度" prop="thickness"><el-input v-model="form.thickness" placeholder="如：3mm、5mm" :disabled="isEdit && initialData?.confirmed" /></el-form-item>

      <el-divider content-position="left">包含产品及数量</el-divider>
      <el-form-item label="产品列表">
        <el-button type="primary" size="small" :icon="Plus" :disabled="!canAddMoreProducts" @click="addProductItem">添加产品</el-button>
        <div style="font-size: 12px; color: #909399; margin-top: 5px;">{{ productListHint }}</div>
        <el-table :data="productItems" border style="width: 100%; margin-top: 15px;">
          <el-table-column label="产品名称" min-width="250">
            <template #default="scope">
              <el-select v-model="scope.row.product" placeholder="请选择产品" filterable style="width: 100%;">
                <el-option v-for="p in productList" :key="p.id" :label="`${p.name} (${p.code})`" :value="p.id" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="拼版个数" width="120">
            <template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" style="width: 100%;" size="small" /></template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope"><el-button type="danger" size="small" :icon="Delete" @click="removeProductItem(scope.$index)" /></template>
          </el-table-column>
        </el-table>
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
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  initialData: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  productList: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit', 'close', 'update:visible'])

const formRef = ref(null)
const productItems = ref([])

const FORM_INITIAL_VALUES = { code: '', name: '', die_type: 'dedicated', size: '', material: '', thickness: '', notes: '' }
const DIE_TYPE_OPTIONS = [
  { value: 'combined', label: '拼版刀模', description: '多产品同时切割，一次模切产出多种产品' },
  { value: 'dedicated', label: '专用刀模', description: '单产品专用，只能切割一种产品' },
  { value: 'universal', label: '通用刀模', description: '多产品可共用，但每次只切一种产品' }
]

const form = reactive({ ...FORM_INITIAL_VALUES })
const dieTypeOptions = DIE_TYPE_OPTIONS

const rules = {
  name: [{ required: true, message: '请输入刀模名称', trigger: 'blur' }, { max: 200, message: '刀模名称不能超过200个字符', trigger: 'blur' }],
  code: [{ max: 50, message: '编码不能超过50个字符', trigger: 'blur' }],
  die_type: [{ required: true, message: '请选择刀模类型', trigger: 'change' }],
  size: [{ max: 100, message: '尺寸不能超过100个字符', trigger: 'blur' }],
  material: [{ max: 100, message: '材质不能超过100个字符', trigger: 'blur' }],
  thickness: [{ max: 50, message: '厚度不能超过50个字符', trigger: 'blur' }]
}

const dialogVisibleSync = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => props.dialogType === 'edit' ? '编辑刀模' : '新建刀模')
const isEdit = computed(() => props.dialogType === 'edit')

const canAddMoreProducts = computed(() => form.die_type === 'dedicated' ? productItems.value.length < 1 : true)
const productListHint = computed(() => ({ combined: '拼版刀模：可添加多个产品', dedicated: '专用刀模：只能添加1个产品', universal: '通用刀模：可添加多个产品' })[form.die_type] || '')

watch(() => props.visible, (val) => { if (val) initForm() })

watch(() => form.die_type, (newType) => {
  if (newType === 'dedicated' && productItems.value.length > 1) {
    ElMessageBox.confirm('专用刀模只能关联1个产品，是否只保留第一个产品？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
      .then(() => { productItems.value = productItems.value.slice(0, 1) })
      .catch(() => {})
  }
})

const initForm = () => {
  if (props.dialogType === 'edit' && props.initialData) {
    Object.assign(form, {
      code: props.initialData.code || '',
      name: props.initialData.name || '',
      die_type: props.initialData.die_type || 'dedicated',
      size: props.initialData.size || '',
      material: props.initialData.material || '',
      thickness: props.initialData.thickness || '',
      notes: props.initialData.notes || ''
    })
    productItems.value = (props.initialData.products || []).map(p => ({ id: p.id, product: p.product, quantity: p.quantity, sort_order: p.sort_order || 0 }))
  } else {
    Object.assign(form, FORM_INITIAL_VALUES)
    productItems.value = []
  }
  nextTick(() => { formRef.value?.clearValidate() })
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL_VALUES)
  productItems.value = []
  nextTick(() => { formRef.value?.clearValidate() })
}

const addProductItem = () => {
  if (!canAddMoreProducts.value) { ElMessage.warning('专用刀模只能添加1个产品'); return }
  productItems.value.push({ product: null, quantity: 1, sort_order: productItems.value.length })
}

const removeProductItem = (index) => { productItems.value.splice(index, 1) }

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const data = { ...form }
  if (!isEdit.value && !data.code) delete data.code

  const relationTypeByDieType = form.die_type === 'combined' ? 'imposition' : 'exclusive'
  data.products_data = productItems.value.filter(item => item.product).map(item => ({ product: item.product, quantity: item.quantity || 1, relation_type: relationTypeByDieType }))

  emit('submit', data)
}

const handleCancel = () => { emit('update:visible', false) }
const handleClose = () => { resetForm(); emit('close') }
</script>
