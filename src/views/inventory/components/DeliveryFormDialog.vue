<template>
  <BaseDialog :show="dialogVisible" :title="isEdit ? '编辑发货单' : '新建发货单'" width="extra-wide" @close="handleClose">
    <div class="space-y-4">
      <h4 class="mb-4 border-b-2 border-primary-500 pb-2 text-base font-medium text-gray-700 dark:text-gray-200">基本信息</h4>
      <div class="flex flex-wrap gap-5">
        <div class="flex-1 min-w-[300px]">
          <label class="input-label mb-1.5 block">销售订单</label>
          <Select v-model="localForm.sales_order" placeholder="请选择销售订单" :searchable="true" :disabled="isEdit" :options="salesOrderOptions" @change="handleSalesOrderChange" />
        </div>
        <div class="flex-1 min-w-[300px]">
          <label class="input-label mb-1.5 block">客户</label>
          <Select v-model="localForm.customer" placeholder="请选择客户" :searchable="true" :disabled="isEdit" :options="customerOptions" @change="handleCustomerChange" />
        </div>
      </div>
      <h4 class="mb-4 border-b-2 border-primary-500 pb-2 text-base font-medium text-gray-700 dark:text-gray-200">收货信息</h4>
      <div class="flex flex-wrap gap-5">
        <div class="flex-1 min-w-[300px]"><Input v-model="localForm.receiver_name" label="收货人" placeholder="请输入收货人" /></div>
        <div class="flex-1 min-w-[300px]"><Input v-model="localForm.receiver_phone" label="联系电话" placeholder="请输入联系电话" /></div>
      </div>
      <TextArea v-model="localForm.delivery_address" label="送货地址" :rows="2" placeholder="请输入送货地址" />
      <h4 class="mb-4 border-b-2 border-primary-500 pb-2 text-base font-medium text-gray-700 dark:text-gray-200">物流信息</h4>
      <div class="flex flex-wrap gap-5">
        <div class="flex-1 min-w-[300px]"><label class="input-label mb-1.5 block">发货日期</label><input type="date" v-model="localForm.delivery_date" class="input w-full" /></div>
        <div class="flex-1 min-w-[300px]"><label class="input-label mb-1.5 block">物流公司</label><Select v-model="localForm.logistics_company" placeholder="请选择物流公司" :searchable="true" :creatable="true" :options="logisticsOptions" /></div>
      </div>
      <div class="flex flex-wrap gap-5">
        <div class="flex-1 min-w-[300px]"><Input v-model="localForm.tracking_number" label="物流单号" placeholder="请输入物流单号" /></div>
        <div class="flex-1 min-w-[300px]"><label class="input-label mb-1.5 block">运费（元）</label><InputNumber v-model="localForm.freight" :precision="2" :min="0" class="w-full" /></div>
      </div>
      <div class="flex flex-wrap gap-5">
        <div class="flex-1 min-w-[300px]"><label class="input-label mb-1.5 block">包裹数量</label><InputNumber v-model="localForm.package_count" :min="1" class="w-full" /></div>
        <div class="flex-1 min-w-[300px]"><label class="input-label mb-1.5 block">总重量(kg)</label><InputNumber v-model="localForm.package_weight" :precision="2" :min="0" class="w-full" /></div>
      </div>
      <h4 class="mb-4 flex items-center justify-between border-b-2 border-primary-500 pb-2 text-base font-medium text-gray-700 dark:text-gray-200">
        <span>发货明细</span>
        <button class="btn btn-primary btn-sm" @click="addItem"><Icon name="plus" class="mr-1 inline h-3 w-3" />添加明细</button>
      </h4>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-600 dark:bg-dark-800">
              <th class="border border-gray-200 px-3 py-2 text-left font-medium dark:border-dark-600" style="min-width:250px">产品</th>
              <th class="border border-gray-200 px-3 py-2 text-left font-medium dark:border-dark-600" style="width:150px">数量</th>
              <th class="border border-gray-200 px-3 py-2 text-left font-medium dark:border-dark-600" style="width:160px">库存批次</th>
              <th class="border border-gray-200 px-3 py-2 text-left font-medium dark:border-dark-600" style="width:100px">单位</th>
              <th class="border border-gray-200 px-3 py-2 text-left font-medium dark:border-dark-600" style="width:150px">单价（元）</th>
              <th class="border border-gray-200 px-3 py-2 text-right font-medium dark:border-dark-600" style="width:120px">小计（元）</th>
              <th class="border border-gray-200 px-3 py-2 text-center font-medium dark:border-dark-600" style="width:80px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in localForm.items_data" :key="index" class="border-b border-gray-100 dark:border-dark-700">
              <td class="border border-gray-200 px-2 py-1.5 dark:border-dark-600"><Select v-model="item.product" placeholder="请选择产品" :searchable="true" :options="productOptions" /></td>
              <td class="border border-gray-200 px-2 py-1.5 dark:border-dark-600"><InputNumber v-model="item.quantity" :min="1" :precision="2" /></td>
              <td class="border border-gray-200 px-2 py-1.5 dark:border-dark-600"><input v-model="item.stock_batch" placeholder="批次号（可选）" class="input w-full" /></td>
              <td class="border border-gray-200 px-2 py-1.5 dark:border-dark-600"><input v-model="item.unit" placeholder="单位" class="input w-full" /></td>
              <td class="border border-gray-200 px-2 py-1.5 dark:border-dark-600"><InputNumber v-model="item.unit_price" :min="0" :precision="2" /></td>
              <td class="border border-gray-200 px-2 py-1.5 text-right dark:border-dark-600">¥{{ calculateSubtotal(item).toFixed(2) }}</td>
              <td class="border border-gray-200 px-2 py-1.5 text-center dark:border-dark-600"><button class="btn btn-danger btn-sm" @click="removeItem(index)"><Icon name="trash" class="h-3 w-3" /></button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <TextArea v-model="localForm.notes" label="备注" :rows="3" placeholder="请输入备注信息" class="mt-6" />
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="submitting" @click="handleSubmit">提交</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from 'vue'
import { Icon, Input, InputNumber, TextArea, Select, BaseDialog } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'
const props = defineProps({
  visible: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  form: { type: Object, default: () => ({}) },
  customerList: { type: Array as any, default: () => [] },
  salesOrderList: { type: Array as any, default: () => [] },
  productList: { type: Array as any, default: () => [] }
})
const emit = defineEmits(['submit', 'close', 'update:visible', 'sales-order-change', 'customer-change'])
const ITEM_INITIAL = { product: null, sales_order_item: null, quantity: 1, unit: '件', unit_price: 0, stock_batch: '', notes: '' }
const localForm = reactive({ ...props.form })
const salesOrderOptions = computed(() =>
  props.salesOrderList.map((so: any) => ({ value: so.id, label: so.order_number + ' - ' + (so.customer_name || '') }))
)
const customerOptions = computed(() =>
  props.customerList.map((c: any) => ({ value: c.id, label: c.name }))
)
const productOptions = computed(() =>
  props.productList.map((p: any) => ({ value: p.id, label: p.name + ' (' + (p.code || '') + ')' }))
)
const logisticsOptions = [
  { value: '顺丰速运', label: '顺丰速运' },
  { value: '中通快递', label: '中通快递' },
  { value: '圆通速递', label: '圆通速递' },
  { value: '申通快递', label: '申通快递' },
  { value: '韵达快递', label: '韵达快递' },
  { value: '德邦物流', label: '德邦物流' },
  { value: '京东物流', label: '京东物流' }
]
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

watch(() => props.visible, (val: any) => { if (val) nextTick(() => {}) })
watch(() => props.form, (val: any) => { Object.assign(localForm, val) }, { immediate: true, deep: true })
const handleClose = () => emit('update:visible', false)
const handleSalesOrderChange = (value: any) => emit('sales-order-change', value)
const handleCustomerChange = (value: any) => emit('customer-change', value)
const addItem = () => { if (!localForm.items_data) localForm.items_data = []; localForm.items_data.push({ ...ITEM_INITIAL }) }
const removeItem = (index: any) => localForm.items_data?.splice(index, 1)
const calculateSubtotal = (item: any) => (item.quantity || 0) * (item.unit_price || 0)
const validateItems = () => {
  if (!localForm.items_data?.length) { ErrorHandler.showWarning('请至少添加一条发货明细'); return false }
  for (let i = 0; i < localForm.items_data.length; i++) {
    const item = localForm.items_data[i]
    if (!item.product) { ErrorHandler.showError('第' + (i + 1) + '行：请选择产品'); return false }
    if (!item.quantity || item.quantity <= 0) { ErrorHandler.showError('第' + (i + 1) + '行：请输入有效的发货数量'); return false }
    if (item.unit_price === null || item.unit_price === undefined || item.unit_price < 0) { ErrorHandler.showError('第' + (i + 1) + '行：请输入有效的单价'); return false }
  }
  return true
}
const handleSubmit = () => {
  if (!localForm.customer) { ErrorHandler.showWarning('请选择客户'); return }
  if (!localForm.sales_order) { ErrorHandler.showWarning('请选择销售订单'); return }
  if (!localForm.receiver_name) { ErrorHandler.showWarning('请输入收货人'); return }
  if (!localForm.receiver_phone) { ErrorHandler.showWarning('请输入联系电话'); return }
  if (!/^1[3-9]\d{9}$/.test(localForm.receiver_phone)) { ErrorHandler.showWarning('请输入有效的手机号码'); return }
  if (!localForm.delivery_address) { ErrorHandler.showWarning('请输入送货地址'); return }
  if (!localForm.delivery_date) { ErrorHandler.showWarning('请选择发货日期'); return }
  if (!localForm.package_count) { ErrorHandler.showWarning('请输入包裹数量'); return }
  if (!validateItems()) return
  emit('submit')
}
</script>
