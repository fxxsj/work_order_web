<template>
  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑发货单' : '新建发货单'" width="var(--ui-dialog-width-xl)" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="localForm" :rules="rules" label-width="100px">
      <h4 class="form-section-title">基本信息</h4>
      <el-row :gutter="20" class="responsive-form-row">
        <el-col :xs="24" :md="12"><el-form-item label="销售订单" prop="sales_order">
          <el-select v-model="localForm.sales_order" placeholder="请选择销售订单" filterable :disabled="isEdit" style="width: 100%" @change="handleSalesOrderChange">
            <el-option v-for="so in salesOrderList" :key="so.id" :label="`${so.order_number} - ${so.customer_name || ''}`" :value="so.id" />
          </el-select>
        </el-form-item></el-col>
        <el-col :xs="24" :md="12"><el-form-item label="客户" prop="customer">
          <el-select v-model="localForm.customer" placeholder="请选择客户" filterable :disabled="isEdit" style="width: 100%" @change="handleCustomerChange">
            <el-option v-for="c in customerList" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item></el-col>
      </el-row>

      <h4 class="form-section-title">收货信息</h4>
      <el-row :gutter="20" class="responsive-form-row">
        <el-col :xs="24" :md="12"><el-form-item label="收货人" prop="receiver_name"><el-input v-model="localForm.receiver_name" placeholder="请输入收货人" /></el-form-item></el-col>
        <el-col :xs="24" :md="12"><el-form-item label="联系电话" prop="receiver_phone"><el-input v-model="localForm.receiver_phone" placeholder="请输入联系电话" /></el-form-item></el-col>
      </el-row>
      <el-form-item label="送货地址" prop="delivery_address"><el-input v-model="localForm.delivery_address" type="textarea" :rows="2" placeholder="请输入送货地址" /></el-form-item>

      <h4 class="form-section-title">物流信息</h4>
      <el-row :gutter="20" class="responsive-form-row">
        <el-col :xs="24" :md="12"><el-form-item label="发货日期" prop="delivery_date"><el-date-picker v-model="localForm.delivery_date" type="date" placeholder="请选择发货日期" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
        <el-col :xs="24" :md="12"><el-form-item label="物流公司"><el-select v-model="localForm.logistics_company" placeholder="请选择物流公司" filterable allow-create style="width: 100%">
          <el-option label="顺丰速运" value="顺丰速运" /><el-option label="中通快递" value="中通快递" /><el-option label="圆通速递" value="圆通速递" /><el-option label="申通快递" value="申通快递" /><el-option label="韵达快递" value="韵达快递" /><el-option label="德邦物流" value="德邦物流" /><el-option label="京东物流" value="京东物流" />
        </el-select></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20" class="responsive-form-row">
        <el-col :xs="24" :md="12"><el-form-item label="物流单号"><el-input v-model="localForm.tracking_number" placeholder="请输入物流单号" /></el-form-item></el-col>
        <el-col :xs="24" :md="12"><el-form-item label="运费（元）"><el-input-number v-model="localForm.freight" :precision="2" :min="0" style="width: 100%" /></el-form-item></el-col>
      </el-row>
      <el-row :gutter="20" class="responsive-form-row">
        <el-col :xs="24" :md="12"><el-form-item label="包裹数量" prop="package_count"><el-input-number v-model="localForm.package_count" :min="1" style="width: 100%" /></el-form-item></el-col>
        <el-col :xs="24" :md="12"><el-form-item label="总重量(kg)"><el-input-number v-model="localForm.package_weight" :precision="2" :min="0" style="width: 100%" /></el-form-item></el-col>
      </el-row>

      <h4 class="form-section-title">发货明细<el-button type="primary" size="small" :icon="Plus" @click="addItem">添加明细</el-button></h4>
      <div class="delivery-items-table">
      <el-table :data="localForm.items_data" border style="width: 100%">
        <el-table-column label="产品" width="250"><template #default="scope">
          <el-select v-model="scope.row.product" placeholder="请选择产品" filterable style="width: 100%">
            <el-option v-for="p in productList" :key="p.id" :label="`${p.name} (${p.code || ''})`" :value="p.id" />
          </el-select>
        </template></el-table-column>
        <el-table-column label="数量" width="150"><template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" :precision="2" style="width: 100%" /></template></el-table-column>
        <el-table-column label="库存批次" width="160"><template #default="scope"><el-input v-model="scope.row.stock_batch" placeholder="批次号（可选）" /></template></el-table-column>
        <el-table-column label="单位" width="100"><template #default="scope"><el-input v-model="scope.row.unit" placeholder="单位" /></template></el-table-column>
        <el-table-column label="单价（元）" width="150"><template #default="scope"><el-input-number v-model="scope.row.unit_price" :min="0" :precision="2" style="width: 100%" /></template></el-table-column>
        <el-table-column label="小计（元）" width="120"><template #default="scope">¥{{ calculateSubtotal(scope.row).toFixed(2) }}</template></el-table-column>
        <el-table-column label="操作" width="80"><template #default="scope"><el-button type="danger" size="small" :icon="Delete" @click="removeItem(scope.$index)" /></template></el-table-column>
      </el-table>
      </div>
      <el-form-item label="备注" class="notes-field"><el-input v-model="localForm.notes" type="textarea" :rows="3" placeholder="请输入备注信息" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  visible: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  form: { type: Object, default: () => ({}) },
  customerList: { type: Array, default: () => [] },
  salesOrderList: { type: Array, default: () => [] },
  productList: { type: Array, default: () => [] }
})

const emit = defineEmits(['submit', 'close', 'update:visible', 'sales-order-change', 'customer-change'])

const formRef = ref(null)
const ITEM_INITIAL = { product: null, sales_order_item: null, quantity: 1, unit: '件', unit_price: 0, stock_batch: '', notes: '' }
const localForm = reactive({ ...props.form })

const rules = {
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  sales_order: [{ required: true, message: '请选择销售订单', trigger: 'change' }],
  receiver_name: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  receiver_phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }],
  delivery_address: [{ required: true, message: '请输入送货地址', trigger: 'blur' }],
  delivery_date: [{ required: true, message: '请选择发货日期', trigger: 'change' }],
  package_count: [{ required: true, message: '请输入包裹数量', trigger: 'blur' }]
}

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

import { computed } from 'vue'

watch(() => props.visible, (val) => { if (val) nextTick(() => { formRef.value?.clearValidate() }) })
watch(() => props.form, (val) => { Object.assign(localForm, val) }, { immediate: true, deep: true })

const handleClose = () => emit('update:visible', false)
const handleSalesOrderChange = (value) => emit('sales-order-change', value)
const handleCustomerChange = (value) => emit('customer-change', value)
const addItem = () => { if (!localForm.items_data) localForm.items_data = []; localForm.items_data.push({ ...ITEM_INITIAL }) }
const removeItem = (index) => localForm.items_data?.splice(index, 1)
const calculateSubtotal = (item) => (item.quantity || 0) * (item.unit_price || 0)

const validateItems = () => {
  if (!localForm.items_data?.length) { ErrorHandler.showWarning('请至少添加一条发货明细'); return false }
  for (let i = 0; i < localForm.items_data.length; i++) {
    const item = localForm.items_data[i]
    if (!item.product) { ErrorHandler.showError(`第${i + 1}行：请选择产品`); return false }
    if (!item.quantity || item.quantity <= 0) { ErrorHandler.showError(`第${i + 1}行：请输入有效的发货数量`); return false }
    if (item.unit_price === null || item.unit_price === undefined || item.unit_price < 0) { ErrorHandler.showError(`第${i + 1}行：请输入有效的单价`); return false }
  }
  return true
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return
    if (!validateItems()) return
    emit('submit')
  })
}
</script>

<style scoped>
.form-section-title { margin: var(--ui-section-gap) 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #409eff; color: #303133; font-size: 16px; font-weight: 500; display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.delivery-items-table { overflow-x: auto; }
.notes-field { margin-top: var(--ui-section-gap); }
</style>
