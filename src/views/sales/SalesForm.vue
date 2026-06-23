<template>
  <div class="pb-32 sm:pb-24">
    <div class="card">
      <div class="card-body space-y-4">
        <!-- 编辑模式：只读上下文信息 -->
        <div
          v-if="isEdit && editContext"
          class="grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl bg-gray-50 p-4 dark:bg-dark-800"
        >
          <div>
            <div class="input-label mb-1">
              订单号
            </div>
            <div class="font-medium">
              {{ editContext.order_number || '保存后生成' }}
            </div>
          </div>
          <div>
            <div class="input-label mb-1">
              状态
            </div>
            <StatusTag
              :status="editContext.status"
              category="salesOrder"
              effect="plain"
            />
          </div>
          <div>
            <div class="input-label mb-1">
              付款状态
            </div>
            <StatusTag
              :status="editContext.payment_status"
              category="payment"
              effect="plain"
            />
          </div>
        </div>

        <!-- 客户信息 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomerSelector
            :model-value="form.customer ?? undefined"
            label="客户"
            :customers="customerOptions"
            @update:model-value="handleCustomerChange"
            @select="handleCustomerSelect"
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
            v-model="form.contract_number"
            label="合同号"
            placeholder="请输入合同号"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            v-model="form.contact_person"
            label="联系人"
            placeholder="请输入联系人"
          />
          <Input
            v-model="form.contact_phone"
            label="联系电话"
            placeholder="请输入联系电话"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TextArea
            v-model="form.shipping_address"
            label="送货地址"
            :rows="1"
            placeholder="请输入送货地址"
          />
        </div>

        <!-- 订单明细 -->
        <div>
          <SectionDivider title="订单明细" />
          <div class="mb-3 flex flex-wrap items-center gap-3">
            <button
              class="btn btn-primary btn-sm"
              @click="handleAddItem"
            >
              <Icon
                name="plus"
                class="h-3 w-3"
              /> 添加产品
            </button>
            <div class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-300">
              <span>明细行</span>
              <span class="font-bold text-primary-600 dark:text-primary-400">{{ form.items.length }}</span>
            </div>
            <div class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-300">
              <span>总数量</span>
              <span class="font-bold text-primary-600 dark:text-primary-400">{{ totalQuantity }}</span>
            </div>
            <div class="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-sm text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
              <span>合计</span>
              <span class="font-bold text-primary-600 dark:text-primary-400">¥{{ totalAmount.toLocaleString() }}</span>
            </div>
            <button
              type="button"
              class="btn btn-ghost btn-sm inline-flex items-center gap-1"
              @click="showAdvancedColumns = !showAdvancedColumns"
            >
              <Icon
                :name="showAdvancedColumns ? 'eyeOff' : 'eye'"
                class="h-3 w-3"
              />
              {{ showAdvancedColumns ? '隐藏高级字段' : '显示税率/折扣' }}
            </button>
          </div>
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
              <template #cell-tax_rate="{ row }">
                <InputNumber
                  v-if="showAdvancedColumns"
                  v-model="row.tax_rate"
                  :min="0"
                  :max="100"
                  :precision="2"
                  class="w-full"
                />
                <span v-else class="text-gray-400 text-sm">-</span>
              </template>
              <template #cell-discount_amount="{ row }">
                <InputNumber
                  v-if="showAdvancedColumns"
                  v-model="row.discount_amount"
                  :min="0"
                  :precision="2"
                  class="w-full"
                />
                <span v-else class="text-gray-400 text-sm">-</span>
              </template>
              <template #cell-amount="{ row }">
                <div class="space-y-0.5 text-xs">
                  <div>
                    折后: ¥{{ calcLineSubtotal(row).toLocaleString() }}
                  </div>
                  <div>
                    税额: ¥{{ calcLineTax(row).toLocaleString() }}
                  </div>
                  <div class="font-medium">
                    合计: ¥{{ calcLineTotal(row).toLocaleString() }}
                  </div>
                </div>
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

        <!-- 金额与结算 -->
        <SectionDivider title="金额与结算">
          <template #action>
            <button
              type="button"
              class="btn btn-ghost btn-sm inline-flex items-center gap-1"
              @click="showFinanceSection = !showFinanceSection"
            >
              <Icon
                :name="showFinanceSection ? 'chevronUp' : 'chevronDown'"
                class="h-3 w-3"
              />
              {{ showFinanceSection ? '收起' : '展开' }}
            </button>
          </template>
        </SectionDivider>
        <div v-if="showFinanceSection" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label class="input-label mb-1.5 block">税率 (%)</label>
            <InputNumber
              v-model="form.tax_rate"
              :min="0"
              :max="100"
              :precision="2"
              class="w-full"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">整单折扣金额</label>
            <InputNumber
              v-model="form.discount_amount"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">定金</label>
            <InputNumber
              v-model="form.deposit_amount"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">已付金额</label>
            <InputNumber
              v-model="form.paid_amount"
              :min="0"
              :precision="2"
              class="w-full"
            />
          </div>
        </div>
        <div v-if="showFinanceSection">
          <div>
            <label class="input-label mb-1.5 block">付款日期</label>
            <Input
              v-model="form.payment_date"
              type="date"
            />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-300">
            <span>明细小计</span>
            <span class="text-base font-bold text-primary-600 dark:text-primary-400">¥{{ itemsSubtotal.toLocaleString() }}</span>
          </div>
          <div class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-300">
            <span>税额</span>
            <span class="text-base font-bold text-primary-600 dark:text-primary-400">¥{{ orderTax.toLocaleString() }}</span>
          </div>
          <div class="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            <span>合计金额</span>
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">¥{{ totalAmount.toLocaleString() }}</span>
          </div>
        </div>
        <TextArea
          v-model="form.notes"
          label="备注"
          :rows="3"
          placeholder="请输入备注"
        />

        <!-- 编辑模式：订单跟进 -->
        <template v-if="isEdit && editContext">
          <SectionDivider title="订单跟进" />
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="input-label mb-1.5 block">实际交货日期</label>
              <div class="leading-10 text-sm">
                {{ editContext.actual_delivery_date || '-' }}
              </div>
            </div>
            <div>
              <label class="input-label mb-1.5 block">收款次数</label>
              <div class="leading-10 text-sm">
                {{ editContext.payment_count ?? 0 }} 次
              </div>
            </div>
            <div>
              <label class="input-label mb-1.5 block">待收款计划</label>
              <div class="leading-10 text-sm">
                {{ editContext.pending_payment_plan_count ?? 0 }} 笔 / ¥{{ (editContext.pending_payment_plan_amount || 0).toLocaleString() }}
              </div>
            </div>
            <div>
              <label class="input-label mb-1.5 block">关联施工单</label>
              <div class="leading-10 text-sm">
                {{ (editContext.work_order_numbers || []).length > 0 ? editContext.work_order_numbers.join('、') : '暂无' }}
              </div>
            </div>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label class="input-label mb-1.5 block">关联送货单</label>
              <div class="leading-10 text-sm">
                {{ (editContext.delivery_order_numbers || []).length > 0 ? editContext.delivery_order_numbers.join('、') : '暂无' }}
              </div>
            </div>
            <div>
              <label class="input-label mb-1.5 block">关联发票</label>
              <div class="leading-10 text-sm">
                {{ (editContext.invoice_numbers || []).length > 0 ? editContext.invoice_numbers.join('、') : '暂无' }}
              </div>
            </div>
          </div>
        </template>
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
          class="btn btn-secondary min-w-0 flex-1 sm:flex-none"
          :disabled="submitting"
          @click="handleSubmit(false)"
        >
          <span
            v-if="submitting"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent align-middle mr-1"
          />
          <Icon
            v-else
            name="save"
            size="md"
            class="mr-1"
          />
          {{ isEdit ? '保存草稿' : '存为草稿' }}
        </button>
        <button
          class="btn btn-primary min-w-0 flex-1 sm:flex-none"
          :disabled="submitting"
          @click="handleSubmit(true)"
        >
          <span
            v-if="submitting"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-1"
          />
          <Icon
            v-else
            name="send"
            size="md"
            class="mr-1"
          />
          {{ isEdit ? '保存并发布' : '直接发布' }}
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
import { Icon, Input, TextArea, InputNumber, LineItemsTable, SectionDivider, StatusTag } from '@/components/common'
import CustomerSelector from '@/views/customer/components/CustomerSelector.vue'
import ProductSelector from '@/views/product/components/ProductSelector.vue'
import { useUIStore } from '@/stores/ui'
import { salesOrderAPI, productAPI, customerAPI } from '@/api/modules'
import { useUserStore } from '@/stores'
import ErrorHandler from '@/utils/errorHandler'
import QuickCustomerCreateDialog from '@/views/customer/components/QuickCustomerCreateDialog.vue'
import QuickProductCreateDialog from '@/views/product/components/QuickProductCreateDialog.vue'

const router = useRouter()
const route = useRoute()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userStore = useUserStore()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value && id.value !== 'create')

const showAdvancedColumns = ref(false)
const showFinanceSection = ref(false)
const showQuickCustomerCreate = ref(false)
const showQuickProductCreate = ref(false)
const pendingProductCreateIndex = ref<number | null>(null)
const customerOptions = ref<any[]>([])
const productOptions = ref<any[]>([])
const editContext = ref<any>(null)

const form = reactive({
  customer: null as number | null,
  order_date: '',
  delivery_date: '',
  contract_number: '',
  contact_person: '',
  contact_phone: '',
  shipping_address: '',
  tax_rate: 13,
  discount_amount: 0,
  deposit_amount: 0,
  paid_amount: 0,
  payment_date: '',
  notes: '',
  items: [{ product: null as number | null, quantity: 1, unit_price: 0, tax_rate: 0, discount_amount: 0, notes: '' }],
})

// 明细行计算
const calcLineSubtotal = (row: any) => (row.quantity || 0) * (row.unit_price || 0) - (row.discount_amount || 0)
const calcLineTax = (row: any) => calcLineSubtotal(row) * ((row.tax_rate || 0) / 100)
const calcLineTotal = (row: any) => calcLineSubtotal(row) + calcLineTax(row)

// 汇总计算
const totalQuantity = computed(() => form.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0))
const itemsSubtotal = computed(() => form.items.reduce((sum: number, item: any) => sum + calcLineSubtotal(item), 0))
const orderTax = computed(() => itemsSubtotal.value * ((form.tax_rate || 0) / 100))
const totalAmount = computed(() => itemsSubtotal.value + orderTax.value - (form.discount_amount || 0))

const toDate = (value: string) => value ? new Date(`${value}T00:00:00`) : null

const lineItemColumns = computed(() => [
  { key: 'product', label: '产品', minWidth: 200 },
  { key: 'spec', label: '规格', width: 120 },
  { key: 'quantity', label: '数量', width: 100 },
  { key: 'unit', label: '单位', width: 80 },
  { key: 'unit_price', label: '单价', width: 120 },
  ...(showAdvancedColumns.value ? [
    { key: 'tax_rate', label: '税率', width: 100 },
    { key: 'discount_amount', label: '折扣', width: 100 },
  ] : []),
  { key: 'amount', label: '金额', width: 140 },
  { key: 'notes', label: '备注', minWidth: 120 },
])

const loadCustomers = async () => {
  try {
    const res: any = await customerAPI.getList({ page_size: 50 })
    customerOptions.value = res?.results || []
// eslint-disable-next-line no-empty
  } catch (_error: any) {}
}

const loadProducts = async () => {
  try {
    const res: any = await productAPI.getList({ page_size: 50 })
    productOptions.value = res?.results || []
// eslint-disable-next-line no-empty
  } catch (_error: any) {}
}

const loadData = async () => {
  if (!isEdit.value) return
  try {
    const res: any = await salesOrderAPI.getDetail(id.value!)
    editContext.value = {
      order_number: res.order_number,
      status: res.status,
      payment_status: res.payment_status,
      actual_delivery_date: res.actual_delivery_date || '',
      payment_count: res.payment_count ?? 0,
      pending_payment_plan_count: res.pending_payment_plan_count ?? 0,
      pending_payment_plan_amount: res.pending_payment_plan_amount ?? 0,
      work_order_numbers: res.work_order_numbers || [],
      delivery_order_numbers: res.delivery_order_numbers || [],
      invoice_numbers: res.invoice_numbers || [],
    }
    Object.assign(form, {
      customer: res.customer,
      order_date: res.order_date,
      delivery_date: res.delivery_date,
      contract_number: res.contract_number || '',
      contact_person: res.contact_person || '',
      contact_phone: res.contact_phone || '',
      shipping_address: res.shipping_address || '',
      tax_rate: res.tax_rate ?? 0,
      discount_amount: res.discount_amount || 0,
      deposit_amount: res.deposit_amount || 0,
      paid_amount: res.paid_amount || 0,
      payment_date: res.payment_date || '',
      notes: res.notes || '',
      items: res.items?.map((i: any) => ({
        product: i.product,
        quantity: i.quantity,
        unit_price: i.unit_price,
        tax_rate: i.tax_rate ?? 0,
        discount_amount: i.discount_amount || 0,
        notes: i.notes || '',
      })) || [],
    })
  } catch (error: any) {
    ErrorHandler.showMessage(error, '加载数据失败')
  }
}

const handleCustomerSelect = (customer: any) => {
  if (customer?.default_tax_rate != null) {
    form.tax_rate = Number(customer.default_tax_rate)
    // 同步更新已有明细行的默认税率（当明细行税率为0或未设置时）
    form.items.forEach((item: any) => {
      if (!item.tax_rate) {
        item.tax_rate = form.tax_rate
      }
    })
  }
}

const handleCustomerChange = (value: any) => {
  form.customer = value
  const customer = customerOptions.value.find((c: any) => c.id === value)
  if (customer) {
    form.contact_person = customer.contact_person || ''
    form.contact_phone = customer.phone || ''
    form.shipping_address = customer.address || ''
    handleCustomerSelect(customer)
  }
}

const handleProductChange = (productId: any, index: any) => {
  form.items[index].product = productId
  const product = productOptions.value.find((p: any) => p.id === productId)
  if (product) {
    form.items[index].unit_price = product.unit_price || 0
    if (!form.items[index].tax_rate) {
      form.items[index].tax_rate = form.tax_rate || 0
    }
  }
}

const openQuickProductCreate = (index: number | null = null) => {
  pendingProductCreateIndex.value = typeof index === 'number' ? index : null
  showQuickProductCreate.value = true
}

const handleAddItem = () => {
  form.items.push({ product: null, quantity: 1, unit_price: 0, tax_rate: form.tax_rate || 0, discount_amount: 0, notes: '' })
}

const handleRemoveItem = (index: any) => {
  if (form.items.length > 1) form.items.splice(index, 1)
}

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

const handleSubmit = async (autoApprove: boolean = false) => {
  if (!form.customer) { useUIStore().showWarning('请选择客户'); return }
  if (!form.order_date) { useUIStore().showWarning('请选择订单日期'); return }
  if (!form.delivery_date) { useUIStore().showWarning('请选择交货日期'); return }
  const orderDate = toDate(form.order_date)
  const deliveryDate = toDate(form.delivery_date)
  if (orderDate && deliveryDate && deliveryDate < orderDate) { useUIStore().showWarning('交货日期不能早于订单日期'); return }
  if (form.tax_rate < 0 || form.tax_rate > 100) { useUIStore().showWarning('税率必须在 0-100 之间'); return }
  if ((form.discount_amount || 0) < 0) { useUIStore().showWarning('折扣金额不能小于 0'); return }
  if ((form.deposit_amount || 0) < 0) { useUIStore().showWarning('定金不能小于 0'); return }
  if ((form.paid_amount || 0) < 0) { useUIStore().showWarning('已付金额不能小于 0'); return }

  const items = form.items
    .filter((i: any) => i.product)
    .map((i: any) => ({
      product: i.product,
      quantity: Number(i.quantity || 0),
      unit: getProductUnit(i.product),
      unit_price: Number(i.unit_price || 0),
      tax_rate: Number(i.tax_rate || 0),
      discount_amount: Number(i.discount_amount || 0),
      notes: (i.notes || '').trim(),
    }))
  if (items.length === 0) { useUIStore().showWarning('请至少选择一个产品'); return }
  if (items.some((i: any) => i.quantity <= 0)) { useUIStore().showWarning('产品数量必须大于 0'); return }
  if (items.some((i: any) => i.unit_price < 0)) { useUIStore().showWarning('产品单价不能小于 0'); return }

  submitting.value = true
  try {
    const data = {
      customer: form.customer,
      order_date: form.order_date,
      delivery_date: form.delivery_date,
      contract_number: form.contract_number.trim(),
      contact_person: form.contact_person.trim(),
      contact_phone: form.contact_phone.trim(),
      shipping_address: form.shipping_address.trim(),
      tax_rate: form.tax_rate,
      discount_amount: form.discount_amount,
      deposit_amount: form.deposit_amount,
      paid_amount: form.paid_amount,
      payment_date: form.payment_date || null,
      notes: form.notes.trim(),
      items,
    }
    let currentId = id.value
    if (isEdit.value) {
      await salesOrderAPI.update(currentId!, data)
    } else {
      const res: any = await salesOrderAPI.create(data)
      currentId = res.id
    }
    
    if (autoApprove && currentId) {
      await salesOrderAPI.submit(currentId, { auto_approve: true })
      useUIStore().showSuccess('发布成功')
    } else {
      useUIStore().showSuccess('保存成功')
    }
    
    router.push('/sales-orders')
  } catch (error: any) {
    ErrorHandler.showMessage(error, isEdit.value ? '保存失败' : '创建失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => { loadCustomers(); loadProducts(); loadData() })
</script>
