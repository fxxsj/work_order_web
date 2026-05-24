<template>
  <div>
    <div class="card">
      <div class="mb-6 border-b border-gray-200 pb-4 dark:border-dark-700">
        <span class="text-base font-bold">{{ isEdit ? '编辑销售订单' : '新建销售订单' }}</span>
      </div>
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Select v-model="form.customer" :options="customerSelectOptions" label="客户" placeholder="请选择客户" searchable class="w-full" @change="handleCustomerChange" />
          <Input v-model="form.order_date" type="date" label="订单日期" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input v-model="form.delivery_date" type="date" label="交货日期" />
          <Input v-model="form.contact_person" label="联系人" placeholder="请输入联系人" />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input v-model="form.contact_phone" label="联系电话" placeholder="请输入联系电话" />
          <TextArea v-model="form.shipping_address" label="送货地址" :rows="1" placeholder="请输入送货地址" />
        </div>

        <div class="my-6 border-t border-gray-200 pt-4 dark:border-dark-700">
          <div class="mb-2 text-sm font-semibold text-gray-700 dark:text-dark-300">订单明细</div>
        </div>
        <div class="mb-6">
          <button class="btn btn-primary btn-sm" @click="handleAddItem"><Icon name="plus" class="h-3 w-3" /> 添加产品</button>
          <div class="mt-3">
            <LineItemsTable
              :columns="lineItemColumns"
              :items="form.items"
              @delete="handleRemoveItem"
            >
              <template #cell-product="{ row, index }">
                <Select v-model="row.product" :options="productSelectOptions" placeholder="请选择产品" searchable class="w-full" @change="(val) => handleProductChange(val, index)" />
              </template>
              <template #cell-spec="{ row }">
                {{ getProductSpec(row.product) }}
              </template>
              <template #cell-quantity="{ row }">
                <InputNumber v-model="row.quantity" :min="1" class="w-full" />
              </template>
              <template #cell-unit="{ row }">
                {{ getProductUnit(row.product) }}
              </template>
              <template #cell-unit_price="{ row }">
                <InputNumber v-model="row.unit_price" :min="0" :precision="2" class="w-full" />
              </template>
              <template #cell-amount="{ row }">
                <span>¥{{ ((row.quantity || 0) * (row.unit_price || 0)).toLocaleString() }}</span>
              </template>
              <template #cell-notes="{ row }">
                <Input v-model="row.notes" placeholder="备注" />
              </template>
            </LineItemsTable>
          </div>
        </div>

        <div class="my-6 border-t border-gray-200 pt-4 dark:border-dark-700">
          <div class="mb-2 text-sm font-semibold text-gray-700 dark:text-dark-300">其他信息</div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label class="input-label mb-1.5 block">税率</label>
            <InputNumber v-model="form.tax_rate" :min="0" :max="100" class="w-full" />
          </div>
          <div>
            <label class="input-label mb-1.5 block">折扣金额</label>
            <InputNumber v-model="form.discount_amount" :min="0" :precision="2" class="w-full" />
          </div>
          <div>
            <label class="input-label mb-1.5 block">合计金额</label>
            <div class="text-xl font-bold text-primary-600 leading-10">¥{{ totalAmount.toLocaleString() }}</div>
          </div>
        </div>
        <TextArea v-model="form.notes" label="备注" :rows="3" placeholder="请输入备注" />
      </div>

      <div class="mt-8 flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-center dark:border-dark-700">
        <button class="btn btn-secondary" @click="goBack">取消</button>
        <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">
          <span v-if="submitting" class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle" />
          {{ isEdit ? '保存' : '创建' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon, Input, TextArea, InputNumber, Select, LineItemsTable } from '@/components/common'
import { ElMessage } from '@/utils/message'
import { salesOrderAPI, productAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value && id.value !== 'create')

const submitting = ref(false)
const customerOptions = ref<any[]>([])
const productOptions = ref<any[]>([])

const form = reactive({
  customer: null, order_date: '', delivery_date: '', contact_person: '', contact_phone: '', shipping_address: '',
  tax_rate: 13, discount_amount: 0, notes: '',
  items: [{ product: null, quantity: 1, unit_price: 0, notes: '' }]
})

const totalAmount = computed(() => {
  const subtotal = form.items.reduce((sum: any, item: any) => sum + (item.quantity || 0) * (item.unit_price || 0), 0)
  const tax = subtotal * (form.tax_rate / 100)
  return subtotal + tax - (form.discount_amount || 0)
})

const customerSelectOptions = computed(() => customerOptions.value.map((c: any) => ({ value: c.id, label: c.name })))
const productSelectOptions = computed(() => productOptions.value.map((p: any) => ({ value: p.id, label: `${p.name} (${p.code})` })))

const lineItemColumns = [
  { key: 'product', label: '产品', minWidth: 200 },
  { key: 'spec', label: '规格', width: 150 },
  { key: 'quantity', label: '数量', width: 150 },
  { key: 'unit', label: '单位', width: 80 },
  { key: 'unit_price', label: '单价', width: 120 },
  { key: 'amount', label: '金额', width: 120 },
  { key: 'notes', label: '备注', minWidth: 120 },
]

const loadCustomers = async () => { try { const res: any = await customerAPI.getList({ page_size: 1000 }); customerOptions.value = res?.results || [] } catch (error: any) {} }
const loadProducts = async () => { try { const res: any = await productAPI.getList({ page_size: 1000 }); productOptions.value = res?.results || [] } catch (error: any) {} }
const loadData = async () => {
  if (!isEdit.value) return
  try { const res: any = await salesOrderAPI.getDetail(id.value!); Object.assign(form, { customer: res.customer, order_date: res.order_date, delivery_date: res.delivery_date, contact_person: res.contact_person, contact_phone: res.contact_phone, shipping_address: res.shipping_address, tax_rate: res.tax_rate, discount_amount: res.discount_amount || 0, notes: res.notes, items: res.items?.map((i: any) => ({ product: i.product, quantity: i.quantity, unit_price: i.unit_price, notes: i.notes || '' })) || [] }) } catch (error: any) { ErrorHandler.showMessage(error, '加载数据失败') }
}

const handleCustomerChange = (value: any) => {
  const customer = customerOptions.value.find((c: any) => c.id === value)
  if (customer) { form.contact_person = customer.contact_person || ''; form.contact_phone = customer.phone || ''; form.shipping_address = customer.address || '' }
}
const handleProductChange = (productId: any, index: any) => { const product = productOptions.value.find((p: any) => p.id === productId); if (product) { form.items[index].unit_price = product.unit_price || 0 } }
const handleAddItem = () => { form.items.push({ product: null, quantity: 1, unit_price: 0, notes: '' }) }
const handleRemoveItem = (index: any) => { if (form.items.length > 1) form.items.splice(index, 1) }
const getProductSpec = (productId: any) => productOptions.value.find((p: any) => p.id === productId)?.specification || '-'
const getProductUnit = (productId: any) => productOptions.value.find((p: any) => p.id === productId)?.unit || '-'
const goBack = () => { router.push('/sales') }

const handleSubmit = async () => {
  if (!form.customer) { ElMessage.warning('请选择客户'); return }
  if (!form.order_date) { ElMessage.warning('请选择订单日期'); return }
  if (!form.delivery_date) { ElMessage.warning('请选择交货日期'); return }
  if (!form.items.some((i: any) => i.product)) { ElMessage.warning('请至少选择一个产品'); return }

  submitting.value = true
  try {
    const data = { ...form, items_data: form.items.filter((i: any) => i.product).map((i: any) => ({ product: i.product, quantity: i.quantity, unit_price: i.unit_price, notes: i.notes })) }
    delete (data as any).items
    if (isEdit.value) { await salesOrderAPI.update(id.value!, data); ElMessage.success('保存成功') } else { await salesOrderAPI.create(data); ElMessage.success('创建成功') }
    router.push('/sales')
  } catch (error: any) { ErrorHandler.showMessage(error, isEdit.value ? '保存失败' : '创建失败') } finally { submitting.value = false }
}

onMounted(() => { loadCustomers(); loadProducts(); loadData() })
</script>
