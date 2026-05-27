<template>
  <div>
    <div class="card">
      <div class="card-body space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomerSelector
            :model-value="form.customer ?? undefined"
            label="客户"
            :customers="customerOptions"
            @update:model-value="handleCustomerChange"
            @create="showQuickCustomerCreate = true"
          />
          <Input
            v-model="form.order_date"
            type="date"
            label="订单日期"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="form.delivery_date"
            type="date"
            label="交货日期"
          />
          <Input
            v-model="form.contact_person"
            label="联系人"
            placeholder="请输入联系人"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="form.contact_phone"
            label="联系电话"
            placeholder="请输入联系电话"
          />
          <TextArea
            v-model="form.shipping_address"
            label="送货地址"
            :rows="1"
            placeholder="请输入送货地址"
          />
        </div>

        <div>
          <SectionDivider title="订单明细" />
          <button
            class="btn btn-primary btn-sm"
            @click="handleAddItem"
          >
            <Icon
              name="plus"
              class="h-3 w-3"
            /> 添加产品
          </button>
          <div class="mt-3">
            <LineItemsTable
              :columns="lineItemColumns"
              :items="form.items"
              @delete="handleRemoveItem"
            >
              <template #cell-product="{ row, index }">
                <ProductSelector
                  :model-value="row.product"
                  :products="productOptions"
                  @update:model-value="(val) => handleProductChange(val, index)"
                  @create="openQuickProductCreate(index)"
                />
              </template>
              <template #cell-spec="{ row }">
                {{ getProductSpec(row.product) }}
              </template>
              <template #cell-quantity="{ row }">
                <InputNumber
                  v-model="row.quantity"
                  :min="1"
                  class="w-full"
                />
              </template>
              <template #cell-unit="{ row }">
                {{ getProductUnit(row.product) }}
              </template>
              <template #cell-unit_price="{ row }">
                <InputNumber
                  v-model="row.unit_price"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
              </template>
              <template #cell-amount="{ row }">
                <span>¥{{ ((row.quantity || 0) * (row.unit_price || 0)).toLocaleString() }}</span>
              </template>
              <template #cell-notes="{ row }">
                <Input
                  v-model="row.notes"
                  placeholder="备注"
                />
              </template>
            </LineItemsTable>
          </div>
        </div>

        <SectionDivider title="其他信息" />
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label class="input-label mb-1.5 block">税率</label>
            <InputNumber
              v-model="form.tax_rate"
              :min="0"
              :max="100"
              class="w-full"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">折扣金额</label>
            <InputNumber
              v-model="form.discount_amount"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">合计金额</label>
            <div class="text-xl font-bold text-primary-600 leading-10">
              ¥{{ totalAmount.toLocaleString() }}
            </div>
          </div>
        </div>
        <TextArea
          v-model="form.notes"
          label="备注"
          :rows="3"
          placeholder="请输入备注"
        />
      </div>

      <div class="card-footer flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          class="btn btn-secondary"
          @click="goBack"
        >
          <Icon
            name="arrowLeft"
            size="md"
          />
          取消
        </button>
        <button
          class="btn btn-primary"
          :disabled="submitting"
          @click="handleSubmit"
        >
          <span
            v-if="submitting"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle"
          />
          <Icon
            v-else
            name="check"
            size="md"
          />
          {{ isEdit ? '保存' : '创建' }}
        </button>
      </div>
    </div>
    <QuickCustomerCreateDialog
      v-model:visible="showQuickCustomerCreate"
      @created="handleCustomerCreated"
    />
    <QuickProductCreateDialog
      v-model:visible="showQuickProductCreate"
      @created="handleProductCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon, Input, TextArea, InputNumber, LineItemsTable, SectionDivider } from '@/components/common'
import CustomerSelector from '@/views/customer/components/CustomerSelector.vue'
import ProductSelector from '@/views/product/components/ProductSelector.vue'
import { useUIStore } from '@/stores/ui'
import { salesOrderAPI, productAPI } from '@/api/modules'
import { customerAPI } from '@/api/modules/customer'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import QuickCustomerCreateDialog from '@/views/customer/components/QuickCustomerCreateDialog.vue'
import QuickProductCreateDialog from '@/views/product/components/QuickProductCreateDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value && id.value !== 'create')

const submitting = ref(false)
const showQuickCustomerCreate = ref(false)
const showQuickProductCreate = ref(false)
const pendingProductCreateIndex = ref<number | null>(null)
const customerOptions = ref<any[]>([])
const productOptions = ref<any[]>([])

const form = reactive({
  customer: null as number | null, order_date: '', delivery_date: '', contact_person: '', contact_phone: '', shipping_address: '',
  tax_rate: 13, discount_amount: 0, notes: '',
  items: [{ product: null, quantity: 1, unit_price: 0, notes: '' }]
})

const totalAmount = computed(() => {
  const subtotal = form.items.reduce((sum: any, item: any) => sum + (item.quantity || 0) * (item.unit_price || 0), 0)
  const tax = subtotal * (form.tax_rate / 100)
  return subtotal + tax - (form.discount_amount || 0)
})

const toDate = (value: string) => value ? new Date(`${value}T00:00:00`) : null

const lineItemColumns = [
  { key: 'product', label: '产品', minWidth: 200 },
  { key: 'spec', label: '规格', width: 150 },
  { key: 'quantity', label: '数量', width: 150 },
  { key: 'unit', label: '单位', width: 80 },
  { key: 'unit_price', label: '单价', width: 120 },
  { key: 'amount', label: '金额', width: 120 },
  { key: 'notes', label: '备注', minWidth: 120 },
]

const loadCustomers = async () => { try { const res: any = await customerAPI.getList({ page_size: 50 }); customerOptions.value = res?.results || [] } catch (error: any) {} }
const loadProducts = async () => { try { const res: any = await productAPI.getList({ page_size: 50 }); productOptions.value = res?.results || [] } catch (error: any) {} }
const loadData = async () => {
  if (!isEdit.value) return
  try { const res: any = await salesOrderAPI.getDetail(id.value!); Object.assign(form, { customer: res.customer, order_date: res.order_date, delivery_date: res.delivery_date, contact_person: res.contact_person, contact_phone: res.contact_phone, shipping_address: res.shipping_address, tax_rate: res.tax_rate, discount_amount: res.discount_amount || 0, notes: res.notes, items: res.items?.map((i: any) => ({ product: i.product, quantity: i.quantity, unit_price: i.unit_price, notes: i.notes || '' })) || [] }) } catch (error: any) { ErrorHandler.showMessage(error, '加载数据失败') }
}

const handleCustomerChange = (value: any) => {
  form.customer = value
  const customer = customerOptions.value.find((c: any) => c.id === value)
  if (customer) { form.contact_person = customer.contact_person || ''; form.contact_phone = customer.phone || ''; form.shipping_address = customer.address || '' }
}
const handleProductChange = (productId: any, index: any) => { form.items[index].product = productId; const product = productOptions.value.find((p: any) => p.id === productId); if (product) { form.items[index].unit_price = product.unit_price || 0 } }
const openQuickProductCreate = (index: number | null = null) => {
  pendingProductCreateIndex.value = typeof index === 'number' ? index : null
  showQuickProductCreate.value = true
}
const handleAddItem = () => { form.items.push({ product: null, quantity: 1, unit_price: 0, notes: '' }) }
const handleRemoveItem = (index: any) => { if (form.items.length > 1) form.items.splice(index, 1) }
const getProductSpec = (productId: any) => productOptions.value.find((p: any) => p.id === productId)?.specification || '-'
const getProductUnit = (productId: any) => productOptions.value.find((p: any) => p.id === productId)?.unit || '-'
const goBack = () => { router.push('/sales-orders') }

const handleCustomerCreated = (customer: any) => {
  customerOptions.value.push(customer)
  handleCustomerChange(customer.id)
}

const handleProductCreated = (product: any) => {
  productOptions.value.push(product)
  if (pendingProductCreateIndex.value !== null && form.items[pendingProductCreateIndex.value]) {
    handleProductChange(product.id, pendingProductCreateIndex.value)
  }
  pendingProductCreateIndex.value = null
}

const handleSubmit = async () => {
  if (!form.customer) { useUIStore().showWarning('请选择客户'); return }
  if (!form.order_date) { useUIStore().showWarning('请选择订单日期'); return }
  if (!form.delivery_date) { useUIStore().showWarning('请选择交货日期'); return }
  const orderDate = toDate(form.order_date)
  const deliveryDate = toDate(form.delivery_date)
  if (orderDate && deliveryDate && deliveryDate < orderDate) { useUIStore().showWarning('交货日期不能早于订单日期'); return }
  if (form.tax_rate < 0 || form.tax_rate > 100) { useUIStore().showWarning('税率必须在 0-100 之间'); return }
  if ((form.discount_amount || 0) < 0) { useUIStore().showWarning('折扣金额不能小于 0'); return }

  const items = form.items
    .filter((i: any) => i.product)
    .map((i: any) => ({
      product: i.product,
      quantity: Number(i.quantity || 0),
      unit: getProductUnit(i.product),
      unit_price: Number(i.unit_price || 0),
      notes: (i.notes || '').trim()
    }))
  if (items.length === 0) { useUIStore().showWarning('请至少选择一个产品'); return }
  if (items.some((i: any) => i.quantity <= 0)) { useUIStore().showWarning('产品数量必须大于 0'); return }
  if (items.some((i: any) => i.unit_price < 0)) { useUIStore().showWarning('产品单价不能小于 0'); return }

  submitting.value = true
  try {
    const data = {
      ...form,
      contact_person: form.contact_person.trim(),
      contact_phone: form.contact_phone.trim(),
      shipping_address: form.shipping_address.trim(),
      notes: form.notes.trim(),
      items
    }
    if (isEdit.value) { await salesOrderAPI.update(id.value!, data); useUIStore().showSuccess('保存成功') } else { await salesOrderAPI.create(data); useUIStore().showSuccess('创建成功') }
    router.push('/sales-orders')
  } catch (error: any) { ErrorHandler.showMessage(error, isEdit.value ? '保存失败' : '创建失败') } finally { submitting.value = false }
}

onMounted(() => { loadCustomers(); loadProducts(); loadData() })
</script>
