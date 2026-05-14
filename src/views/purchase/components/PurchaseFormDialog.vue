<template>
  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑采购单' : '新增采购单'" width="var(--ui-dialog-width-xl)" @close="handleClose">
    <el-form ref="formRef" :model="localForm" :rules="rules" label-width="100px">
      <el-row :gutter="20" class="responsive-form-row">
        <el-col :xs="24" :md="12">
          <el-form-item label="供应商" prop="supplier">
            <el-select v-model="localForm.supplier" placeholder="请选择供应商" filterable style="width: 100%">
              <el-option v-for="item in supplierOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-form-item label="关联施工单">
            <el-select v-model="localForm.work_order" placeholder="请选择施工单" clearable filterable style="width: 100%" @change="handleWorkOrderChange">
              <el-option v-for="item in workOrderOptions" :key="item.id" :label="item.order_number" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="备注"><el-input v-model="localForm.notes" type="textarea" :rows="2" placeholder="请输入备注" /></el-form-item>

      <el-divider>采购明细</el-divider>
      <el-button size="small" type="primary" :icon="Plus" @click="handleAddItem">添加明细</el-button>
      <div class="purchase-items-table">
      <el-table :data="localForm.items" border style="margin-top: 10px">
        <el-table-column label="物料" width="250">
          <template #default="scope">
            <el-select v-model="scope.row.material" placeholder="请选择物料" filterable style="width: 100%" @change="handleMaterialChange(scope.row)">
              <el-option v-for="item in materialOptions" :key="item.id" :label="`${item.code} - ${item.name}`" :value="item.id" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="采购数量" width="150">
          <template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" :precision="2" style="width: 100%" /></template>
        </el-table-column>
        <el-table-column label="单价" width="150">
          <template #default="scope"><el-input-number v-model="scope.row.unit_price" :min="0" :precision="2" style="width: 100%" /></template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="right">
          <template #default="scope">¥{{ ((scope.row.quantity || 0) * (scope.row.unit_price || 0)).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="scope"><el-button type="text" style="color: #F56C6C" @click="handleDeleteItem(scope.$index)">删除</el-button></template>
        </el-table-column>
      </el-table>
      </div>
      <div v-if="localForm.items.length > 0" class="total-amount">
        <span>合计金额：</span><span class="amount">¥{{ totalAmount }}</span>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { supplierAPI, materialAPI, workOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  visible: { type: Boolean, default: false },
  formData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'close', 'update:visible'])

const formRef = ref(null)
const loading = ref(false)
const supplierOptions = ref([])
const materialOptions = ref([])
const workOrderOptions = ref([])

const FORM_INITIAL = { supplier: null, work_order: null, work_order_number: '', notes: '', items: [] }
const localForm = reactive({ ...FORM_INITIAL, items: [] })

const rules = { supplier: [{ required: true, message: '请选择供应商', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const totalAmount = computed(() => localForm.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0).toFixed(2))

watch(() => props.visible, (val) => {
  if (val) {
    fetchOptions()
    Object.assign(localForm, {
      ...props.formData,
      items: (props.formData.items || []).map(item => ({ ...item }))
    })
  }
})

const fetchOptions = async () => {
  try {
    const [supplierRes, materialRes, workOrderRes] = await Promise.all([
      supplierAPI.getList({ page_size: 1000, status: 'active' }),
      materialAPI.getList({ page_size: 1000 }),
      workOrderAPI.getList({ page_size: 1000, ordering: '-created_at', approval_status: 'approved' })
    ])
    supplierOptions.value = supplierRes?.results || []
    materialOptions.value = materialRes?.results || []
    workOrderOptions.value = (workOrderRes?.results || []).filter(order => !['completed', 'cancelled'].includes(order.status))
    syncWorkOrderNumber()
  } catch (error) { ErrorHandler.showMessage(error, '获取选项数据') }
}

const handleWorkOrderChange = (value) => {
  const selected = workOrderOptions.value.find(item => item.id === value)
  localForm.work_order_number = selected ? selected.order_number : ''
}

const syncWorkOrderNumber = () => {
  if (!localForm.work_order) return
  const selected = workOrderOptions.value.find(item => item.id === localForm.work_order)
  if (selected) localForm.work_order_number = selected.order_number
}

const handleAddItem = () => { localForm.items.push({ material: null, quantity: 1, unit_price: 0 }) }
const handleDeleteItem = (index) => { localForm.items.splice(index, 1) }

const handleMaterialChange = (row) => {
  const material = materialOptions.value.find(m => m.id === row.material)
  if (material?.unit_price) row.unit_price = material.unit_price
}

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (!localForm.items?.length) { ErrorHandler.showWarning('请至少添加一条采购明细'); return }
  if (localForm.items.find(item => !item.material)) { ErrorHandler.showWarning('请选择所有明细的物料'); return }
  loading.value = true
  try { emit('confirm', { ...localForm }) } finally { loading.value = false }
}

const handleClose = () => {
  formRef.value?.resetFields()
  Object.assign(localForm, { ...FORM_INITIAL, items: [] })
  emit('close')
}
</script>

<style scoped>
.total-amount { margin-top: 16px; text-align: right; font-size: 14px; }
.total-amount .amount { font-size: 18px; color: #F56C6C; font-weight: bold; }
.purchase-items-table { overflow-x: auto; }
</style>
