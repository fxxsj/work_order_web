<template>
  <div class="sales-order-form">
    <el-card>
      <template #header><span class="form-title">{{ isEdit ? '编辑销售订单' : '新建销售订单' }}</span></template>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="客户" prop="customer">
              <el-select v-model="form.customer" placeholder="请选择客户" filterable style="width: 100%" @change="handleCustomerChange">
                <el-option v-for="item in customerOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单日期" prop="order_date">
              <el-date-picker v-model="form.order_date" type="date" placeholder="请选择订单日期" value-format="yyyy-MM-dd" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="交货日期" prop="delivery_date">
              <el-date-picker v-model="form.delivery_date" type="date" placeholder="请选择交货日期" value-format="yyyy-MM-dd" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact_person"><el-input v-model="form.contact_person" placeholder="请输入联系人" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contact_phone"><el-input v-model="form.contact_phone" placeholder="请输入联系电话" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="送货地址" prop="shipping_address"><el-input v-model="form.shipping_address" type="textarea" :rows="1" placeholder="请输入送货地址" /></el-form-item>
          </el-col>
        </el-row>

        <el-divider>订单明细</el-divider>
        <div class="items-section">
          <el-button size="small" type="primary" :icon="Plus" @click="handleAddItem">添加产品</el-button>
          <el-table :data="form.items" border style="margin-top: 15px;">
            <el-table-column label="产品" min-width="200">
              <template #default="scope">
                <el-select v-model="scope.row.product" placeholder="请选择产品" filterable style="width: 100%" @change="(val) => handleProductChange(val, scope.$index)">
                  <el-option v-for="item in productOptions" :key="item.id" :label="`${item.name} (${item.code})`" :value="item.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="规格" width="150"><template #default="scope">{{ getProductSpec(scope.row.product) }}</template></el-table-column>
            <el-table-column label="数量" width="150">
              <template #default="scope"><el-input-number v-model="scope.row.quantity" :min="1" size="small" style="width: 100%" /></template>
            </el-table-column>
            <el-table-column label="单位" width="80"><template #default="scope">{{ getProductUnit(scope.row.product) }}</template></el-table-column>
            <el-table-column label="单价" width="120">
              <template #default="scope"><el-input-number v-model="scope.row.unit_price" :min="0" :precision="2" size="small" style="width: 100%" /></template>
            </el-table-column>
            <el-table-column label="金额" width="120"><template #default="scope">¥{{ ((scope.row.quantity || 0) * (scope.row.unit_price || 0)).toLocaleString() }}</template></el-table-column>
            <el-table-column label="备注" min-width="120"><template #default="scope"><el-input v-model="scope.row.notes" size="small" /></template></el-table-column>
            <el-table-column label="操作" width="80"><template #default="scope"><el-button type="danger" size="small" :icon="Delete" :disabled="form.items.length <= 1" @click="handleRemoveItem(scope.$index)" /></template></el-table-column>
          </el-table>
        </div>

        <el-divider>其他信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="税率"><el-input-number v-model="form.tax_rate" :min="0" :max="100" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="折扣金额"><el-input-number v-model="form.discount_amount" :min="0" :precision="2" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="合计金额"><div class="total-amount">¥{{ totalAmount.toLocaleString() }}</div></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" /></el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { salesOrderAPI, customerAPI, productAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const formRef = ref(null)
const submitting = ref(false)
const customerOptions = ref([])
const productOptions = ref([])
const isEdit = computed(() => !!route.params.id)

const form = reactive({
  customer: null, order_date: '', delivery_date: '', contact_person: '', contact_phone: '', shipping_address: '',
  tax_rate: 13, discount_amount: 0, notes: '',
  items: [{ product: null, quantity: 1, unit_price: 0, notes: '' }]
})

const rules = {
  customer: [{ required: true, message: '请选择客户', trigger: 'change' }],
  order_date: [{ required: true, message: '请选择订单日期', trigger: 'change' }],
  delivery_date: [{ required: true, message: '请选择交货日期', trigger: 'change' }]
}

const totalAmount = computed(() => {
  const subtotal = form.items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0)
  const tax = subtotal * (form.tax_rate / 100)
  return subtotal + tax - (form.discount_amount || 0)
})

const loadCustomers = async () => { try { const res = await customerAPI.getList({ page_size: 1000 }); customerOptions.value = res?.results || [] } catch (error) {} }
const loadProducts = async () => { try { const res = await productAPI.getList({ page_size: 1000 }); productOptions.value = res?.results || [] } catch (error) {} }
const loadData = async () => {
  if (!isEdit.value) return
  try { const res = await salesOrderAPI.getDetail(route.params.id); Object.assign(form, { customer: res.customer, order_date: res.order_date, delivery_date: res.delivery_date, contact_person: res.contact_person, contact_phone: res.contact_phone, shipping_address: res.shipping_address, tax_rate: res.tax_rate, discount_amount: res.discount_amount || 0, notes: res.notes, items: res.items?.map(i => ({ product: i.product, quantity: i.quantity, unit_price: i.unit_price, notes: i.notes || '' })) || [] }) } catch (error) { ErrorHandler.showMessage(error, '加载数据失败') }
}

const handleCustomerChange = (customerId) => { const customer = customerOptions.value.find(c => c.id === customerId); if (customer) { form.contact_person = customer.contact_person || ''; form.contact_phone = customer.phone || ''; form.shipping_address = customer.address || '' } }
const handleProductChange = (productId, index) => { const product = productOptions.value.find(p => p.id === productId); if (product) { form.items[index].unit_price = product.unit_price || 0 } }
const handleAddItem = () => { form.items.push({ product: null, quantity: 1, unit_price: 0, notes: '' }) }
const handleRemoveItem = (index) => { if (form.items.length > 1) form.items.splice(index, 1) }
const getProductSpec = (productId) => productOptions.value.find(p => p.id === productId)?.specification || '-'
const getProductUnit = (productId) => productOptions.value.find(p => p.id === productId)?.unit || '-'
const goBack = () => { router.push('/sales') }

const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  if (!form.items.some(i => i.product)) { ElMessage.warning('请至少选择一个产品'); return }

  submitting.value = true
  try {
    const data = { ...form, items_data: form.items.filter(i => i.product).map(i => ({ product: i.product, quantity: i.quantity, unit_price: i.unit_price, notes: i.notes })) }
    delete data.items
    if (isEdit.value) { await salesOrderAPI.update(route.params.id, data); ElMessage.success('保存成功') } else { await salesOrderAPI.create(data); ElMessage.success('创建成功') }
    router.push('/sales')
  } catch (error) { ErrorHandler.showMessage(error, isEdit.value ? '保存失败' : '创建失败') } finally { submitting.value = false }
}

onMounted(() => { loadCustomers(); loadProducts(); loadData() })
</script>

<style scoped>
.sales-order-form { padding: 20px; }
.form-title { font-weight: bold; font-size: 16px; }
.items-section { margin-bottom: 20px; }
.total-amount { font-size: 20px; font-weight: bold; color: #409EFF; line-height: 40px; }
.form-actions { display: flex; justify-content: center; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
</style>
