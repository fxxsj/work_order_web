<template>
  <div class="pb-32 sm:pb-24">
    <div class="card">
      <div class="card-body space-y-4">
        <SectionDivider title="基本信息" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="input-label mb-1.5 block">客户订单</label>
            <Select
              v-model="form.sales_order"
              placeholder="请选择客户订单"
              :searchable="true"
              :disabled="isEdit"
              :options="salesOrderOptions"
              @change="handleSalesOrderChange"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">客户</label>
            <Select
              v-model="form.customer"
              placeholder="请选择客户"
              :searchable="true"
              :disabled="isEdit"
              :options="customerOptions"
              @change="handleCustomerChange"
            />
          </div>
        </div>

        <SectionDivider title="收货信息" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="form.receiver_name"
            label="收货人"
            placeholder="请输入收货人"
          />
          <Input
            v-model="form.receiver_phone"
            label="联系电话"
            placeholder="请输入联系电话"
          />
        </div>
        <TextArea
          v-model="form.delivery_address"
          label="送货地址"
          :rows="2"
          placeholder="请输入送货地址"
        />

        <SectionDivider title="物流信息" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="input-label mb-1.5 block">发货日期</label>
            <input
              v-model="form.delivery_date"
              type="date"
              class="input w-full"
            >
          </div>
          <div>
            <label class="input-label mb-1.5 block">物流公司</label>
            <Select
              v-model="form.logistics_company"
              placeholder="请选择物流公司"
              :searchable="true"
              :creatable="true"
              :options="logisticsOptions"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="form.tracking_number"
            label="物流单号"
            placeholder="请输入物流单号"
          />
          <div>
            <label class="input-label mb-1.5 block">运费（元）</label>
            <InputNumber
              v-model="form.freight"
              :precision="2"
              :min="0"
              class="w-full"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="input-label mb-1.5 block">包裹数量</label>
            <InputNumber
              v-model="form.package_count"
              :min="1"
              class="w-full"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">总重量(kg)</label>
            <InputNumber
              v-model="form.package_weight"
              :precision="2"
              :min="0"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <SectionDivider title="发货明细" />
          <button
            class="btn btn-primary btn-sm"
            @click="addItem"
          >
            <Icon
              name="plus"
              class="h-3 w-3"
            />
            添加明细
          </button>
        </div>
        <LineItemsTable
          :columns="lineItemColumns"
          :items="form.items_data"
          @delete="removeItem"
        >
          <template #cell-product="{ row }">
            <Select
              v-model="row.product"
              placeholder="请选择产品"
              :searchable="true"
              :options="productOptions"
            />
          </template>
          <template #cell-quantity="{ row }">
            <InputNumber
              v-model="row.quantity"
              :min="1"
              :precision="2"
            />
          </template>
          <template #cell-stock_batch="{ row }">
            <input
              v-model="row.stock_batch"
              placeholder="批次号（可选）"
              class="input w-full"
            >
          </template>
          <template #cell-unit="{ row }">
            <input
              v-model="row.unit"
              placeholder="单位"
              class="input w-full"
            >
          </template>
          <template #cell-unit_price="{ row }">
            <InputNumber
              v-model="row.unit_price"
              :min="0"
              :precision="2"
            />
          </template>
          <template #cell-subtotal="{ row }">
            <span class="text-right">¥{{ calculateSubtotal(row).toFixed(2) }}</span>
          </template>
        </LineItemsTable>
        <TextArea
          v-model="form.notes"
          label="备注"
          :rows="3"
          placeholder="请输入备注信息"
          class="mt-6"
        />
      </div>
    </div>

    <div class="fixed bottom-0 left-4 right-4 z-20 rounded-t-xl border border-b-0 border-gray-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-dark-700 dark:bg-dark-900/95 md:left-6 md:right-6 lg:left-[calc(16rem+2rem)] lg:right-8">
      <div class="flex flex-row gap-3 sm:justify-end">
        <button
          class="btn btn-secondary btn-icon shrink-0"
          aria-label="返回"
          title="返回"
          @click="goBack"
        >
          <Icon
            name="arrowLeft"
            size="md"
          />
        </button>
        <button
          class="btn btn-primary min-w-0 flex-1 sm:flex-none"
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon, Input, InputNumber, LineItemsTable, SectionDivider, Select, TextArea } from '@/components/common'
import { customerAPI } from '@/api/modules/customer'
import { deliveryOrderAPI, productAPI, salesOrderAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()
const route = useRoute()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value)
const submitting = ref(false)
const customerList = ref<any[]>([])
const salesOrderList = ref<any[]>([])
const productList = ref<any[]>([])

const ITEM_INITIAL = { product: null, sales_order_item: null, quantity: 1, unit: '件', unit_price: 0, stock_batch: '', notes: '' }
const getFormInitialValues = () => ({ id: null, sales_order: null, customer: null, delivery_date: '', receiver_name: '', receiver_phone: '', delivery_address: '', logistics_company: '', tracking_number: '', freight: 0, package_count: 1, package_weight: 0, notes: '', items_data: [] as any[] })
const form = reactive(getFormInitialValues())
const deliveryEligibleSalesOrderStatuses = new Set(['approved', 'in_production', 'completed'])

const normalizeId = (value: any) => {
  if (value && typeof value === 'object') return normalizeId(value.id)
  if (value === null || value === undefined || value === '') return null
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : value
}
const sameId = (left: any, right: any) => {
  const leftId = normalizeId(left)
  const rightId = normalizeId(right)
  return leftId !== null && rightId !== null && String(leftId) === String(rightId)
}
const getCustomerId = (record: any) => normalizeId(record?.customer_id ?? record?.customer?.id ?? record?.customer)
const getSalesOrderId = (record: any) => normalizeId(record?.sales_order_id ?? record?.sales_order?.id ?? record?.sales_order)

const customerOptions = computed(() => customerList.value.map((c: any) => ({ value: c.id, label: c.name })))
const productOptions = computed(() => productList.value.map((p: any) => ({ value: p.id, label: p.name + ' (' + (p.code || '') + ')' })))
const salesOrderOptions = computed(() => {
  const selectedCustomerId = normalizeId(form.customer)
  const selectedSalesOrderId = normalizeId(form.sales_order)
  return salesOrderList.value
    .filter((order: any) => {
      const isCurrentOrder = selectedSalesOrderId !== null && sameId(order.id, selectedSalesOrderId)
      const statusAllowed = deliveryEligibleSalesOrderStatuses.has(order.status) || isCurrentOrder
      const customerMatched = !selectedCustomerId || sameId(getCustomerId(order), selectedCustomerId)
      return statusAllowed && customerMatched
    })
    .map((so: any) => ({ value: so.id, label: so.order_number + ' - ' + (so.customer_name || '') }))
})
const logisticsOptions = [
  { value: '顺丰速运', label: '顺丰速运' },
  { value: '中通快递', label: '中通快递' },
  { value: '圆通速递', label: '圆通速递' },
  { value: '申通快递', label: '申通快递' },
  { value: '韵达快递', label: '韵达快递' },
  { value: '德邦物流', label: '德邦物流' },
  { value: '京东物流', label: '京东物流' }
]
const lineItemColumns = [
  { key: 'product', label: '产品', minWidth: 250 },
  { key: 'quantity', label: '数量', width: 150 },
  { key: 'stock_batch', label: '库存批次', width: 160 },
  { key: 'unit', label: '单位', width: 100 },
  { key: 'unit_price', label: '单价（元）', width: 150 },
  { key: 'subtotal', label: '小计（元）', width: 120, align: 'right' as const },
]

const fetchCustomers = async () => {
  try {
    const response: any = await customerAPI.getList({ page_size: 50 })
    customerList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载客户列表失败')
  }
}
const fetchSalesOrders = async () => {
  try {
    const response: any = await salesOrderAPI.getList({ page_size: 50 })
    salesOrderList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载客户订单列表失败')
  }
}
const fetchProducts = async () => {
  try {
    const response: any = await productAPI.getList({ page_size: 50 })
    productList.value = Array.isArray(response) ? response : (response?.results || response?.data || [])
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载产品列表失败')
  }
}

const pickFirstText = (...values: any[]) => values.find(value => typeof value === 'string' && value.trim())?.trim() || ''
const prefillReceiverFromCustomer = (customerId: any) => {
  const customer = customerList.value.find((item: any) => sameId(item.id, customerId))
  if (!customer) return
  if (!form.receiver_name) form.receiver_name = pickFirstText(customer.contact_person, customer.name)
  if (!form.receiver_phone) form.receiver_phone = pickFirstText(customer.phone)
  if (!form.delivery_address) form.delivery_address = pickFirstText(customer.address)
}
const mapSalesOrderItemToDeliveryItem = (item: any) => {
  const quantity = Number(item.quantity || 0)
  const deliveredQuantity = Number(item.delivered_quantity || 0)
  const remainingQuantity = Math.max(quantity - deliveredQuantity, 0)
  if (remainingQuantity <= 0) return null
  return {
    product: normalizeId(item.product_id ?? item.product?.id ?? item.product),
    sales_order_item: normalizeId(item.id),
    quantity: remainingQuantity,
    unit: item.unit || '件',
    unit_price: Number(item.unit_price || 0),
    stock_batch: '',
    notes: ''
  }
}
const applySalesOrderToForm = (salesOrder: any) => {
  const customerId = getCustomerId(salesOrder)
  if (customerId) form.customer = customerId
  form.receiver_name = pickFirstText(salesOrder.contact_person, salesOrder.customer_contact, form.receiver_name)
  form.receiver_phone = pickFirstText(salesOrder.contact_phone, salesOrder.customer_phone, form.receiver_phone)
  form.delivery_address = pickFirstText(salesOrder.shipping_address, salesOrder.customer_address, form.delivery_address)
  prefillReceiverFromCustomer(form.customer)
}
const handleSalesOrderChange = async (orderId: any) => {
  form.sales_order = normalizeId(orderId)
  if (!form.sales_order) {
    form.items_data = []
    return
  }

  const listOrder = salesOrderList.value.find((item: any) => sameId(item.id, form.sales_order))
  if (listOrder) applySalesOrderToForm(listOrder)

  try {
    const detail: any = await salesOrderAPI.getDetail(form.sales_order)
    applySalesOrderToForm(detail)
    form.items_data = (detail.items || [])
      .map(mapSalesOrderItemToDeliveryItem)
      .filter(Boolean)
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载客户订单明细失败')
  }
}
const handleCustomerChange = (customerId: any) => {
  form.customer = normalizeId(customerId)
  prefillReceiverFromCustomer(form.customer)
  const selectedSalesOrder = salesOrderList.value.find((item: any) => sameId(item.id, form.sales_order))
  if (selectedSalesOrder && !sameId(getCustomerId(selectedSalesOrder), form.customer)) {
    form.sales_order = null
    form.items_data = []
  }
}

const mapDeliveryItemToForm = (item: any) => ({
  product: normalizeId(item.product_id ?? item.product?.id ?? item.product),
  sales_order_item: normalizeId(item.sales_order_item_id ?? item.sales_order_item?.id ?? item.sales_order_item),
  quantity: Number(item.quantity || 0),
  unit: item.unit || '件',
  unit_price: Number(item.unit_price || 0),
  stock_batch: item.stock_batch || '',
  notes: item.notes || ''
})
const mapDeliveryToForm = (delivery: any) => ({
  id: delivery.id ?? null,
  sales_order: getSalesOrderId(delivery),
  customer: getCustomerId(delivery),
  delivery_date: delivery.delivery_date || '',
  receiver_name: delivery.receiver_name || '',
  receiver_phone: delivery.receiver_phone || '',
  delivery_address: delivery.delivery_address || '',
  logistics_company: delivery.logistics_company || '',
  tracking_number: delivery.tracking_number || '',
  freight: Number(delivery.freight || 0),
  package_count: Number(delivery.package_count || 1),
  package_weight: Number(delivery.package_weight || 0),
  notes: delivery.notes || '',
  items_data: (delivery.items || []).map(mapDeliveryItemToForm)
})
const loadDetail = async () => {
  if (!id.value) return
  try {
    const detail: any = await deliveryOrderAPI.getDetail(id.value)
    Object.assign(form, getFormInitialValues(), mapDeliveryToForm(detail))
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载发货单失败')
  }
}

const addItem = () => { form.items_data.push({ ...ITEM_INITIAL }) }
const removeItem = (index: any) => form.items_data.splice(index, 1)
const calculateSubtotal = (item: any) => (item.quantity || 0) * (item.unit_price || 0)
const trimText = (value: any) => (typeof value === 'string' ? value.trim() : value)
const emptyToNull = (value: any) => (value === '' || value === undefined ? null : value)
const normalizePayload = () => {
  const payload: Record<string, any> = {
    delivery_date: form.delivery_date,
    receiver_name: trimText(form.receiver_name),
    receiver_phone: trimText(form.receiver_phone),
    delivery_address: trimText(form.delivery_address),
    logistics_company: trimText(form.logistics_company) || '',
    tracking_number: trimText(form.tracking_number) || '',
    freight: Number(form.freight || 0),
    package_count: Number(form.package_count || 1),
    package_weight: emptyToNull(form.package_weight),
    notes: trimText(form.notes) || '',
    items_data: (form.items_data || []).map((item: any) => ({
      product: item.product,
      sales_order_item: emptyToNull(item.sales_order_item),
      quantity: Number(item.quantity || 0),
      unit: trimText(item.unit) || '件',
      unit_price: Number(item.unit_price || 0),
      stock_batch: trimText(item.stock_batch) || '',
      notes: trimText(item.notes) || ''
    }))
  }
  if (!isEdit.value) {
    payload.sales_order = form.sales_order
    payload.customer = form.customer
  }
  return payload
}
const validateItems = () => {
  if (!form.items_data?.length) { ErrorHandler.showWarning('请至少添加一条发货明细'); return false }
  for (let i = 0; i < form.items_data.length; i++) {
    const item = form.items_data[i]
    if (!item.product) { ErrorHandler.showError('第' + (i + 1) + '行：请选择产品'); return false }
    if (!item.quantity || item.quantity <= 0) { ErrorHandler.showError('第' + (i + 1) + '行：请输入有效的发货数量'); return false }
    if (item.unit_price === null || item.unit_price === undefined || item.unit_price < 0) { ErrorHandler.showError('第' + (i + 1) + '行：请输入有效的单价'); return false }
  }
  return true
}
const validateForm = () => {
  if (!form.customer) { ErrorHandler.showWarning('请选择客户'); return false }
  if (!form.sales_order) { ErrorHandler.showWarning('请选择客户订单'); return false }
  if (!form.receiver_name) { ErrorHandler.showWarning('请输入收货人'); return false }
  if (!form.receiver_phone) { ErrorHandler.showWarning('请输入联系电话'); return false }
  if (!/^1[3-9]\d{9}$/.test(form.receiver_phone)) { ErrorHandler.showWarning('请输入有效的手机号码'); return false }
  if (!form.delivery_address) { ErrorHandler.showWarning('请输入送货地址'); return false }
  if (!form.delivery_date) { ErrorHandler.showWarning('请选择发货日期'); return false }
  if (!form.package_count) { ErrorHandler.showWarning('请输入包裹数量'); return false }
  return validateItems()
}
const handleSubmit = async () => {
  if (!validateForm()) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await deliveryOrderAPI.update(id.value!, normalizePayload())
      useUIStore().showSuccess('更新成功')
    } else {
      await deliveryOrderAPI.create(normalizePayload())
      useUIStore().showSuccess('创建成功')
    }
    router.push('/inventory/delivery')
  } catch (error: any) {
    ErrorHandler.showMessage(error, isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}
const goBack = () => router.back()

onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchSalesOrders(), fetchProducts()])
  await loadDetail()
  // 从客户订单详情页跳转过来时，自动选中并填充
  if (!isEdit.value && route.query.sales_order_id) {
    await handleSalesOrderChange(route.query.sales_order_id)
  }
})
</script>
