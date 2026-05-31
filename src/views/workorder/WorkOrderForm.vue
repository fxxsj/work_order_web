<template>
  <div class="work-order-form-page pb-32 sm:pb-24">
    <div class="card">
      <div class="card-body space-y-4">
        <!-- Section: Basic Info -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Sales Order Selector -->
          <Select
            v-model="form.sales_order_id"
            :options="salesOrderOptions"
            label="客户订单"
            placeholder="请选择客户订单（可选）"
            clearable
            searchable
            @change="handleSalesOrderChange"
          />
          <!-- Customer Selector with Quick Create -->
          <CustomerSelector
            ref="customerSelectorRef"
            v-model="form.customer_id"
            label="客户"
            required
            @create="showQuickCustomerCreate = true"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Status: 仅编辑模式显示，新建时固定 pending -->
          <Select
            v-if="isEdit"
            v-model="form.status"
            :options="statusOptions"
            label="状态"
          />
          <!-- Priority -->
          <Select
            v-model="form.priority"
            :options="priorityOptions"
            label="优先级"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Order Date -->
          <Input
            v-model="form.order_date"
            type="date"
            label="下单日期"
          />
          <!-- Delivery Date -->
          <Input
            v-model="form.delivery_date"
            type="date"
            label="交货日期"
            required
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Production Quantity -->
          <InputNumber
            v-model="form.production_quantity"
            :min="1"
            label="生产数量"
            class="w-full"
          />
          <!-- Defective Quantity (edit mode) -->
          <InputNumber
            v-if="isEdit"
            v-model="form.defective_quantity"
            :min="0"
            label="预损数量"
            class="w-full"
          />
        </div>
        <!-- Actual Delivery Date (edit mode only) -->
        <div
          v-if="isEdit"
          class="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <Input
            v-model="form.actual_delivery_date"
            type="date"
            label="实际交货日期"
          />
        </div>
        <!-- Notes -->
        <div class="grid grid-cols-1 gap-4">
          <TextArea
            v-model="form.notes"
            label="备注"
            :rows="3"
            placeholder="请输入备注"
          />
        </div>

        <!-- Section: Products -->
        <div>
          <SectionDivider title="产品明细" />
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div class="text-sm text-gray-500 dark:text-gray-400">
              选择产品并维护生产数量
            </div>
            <div class="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-300">
              <span>总生产数量</span>
              <span class="text-base font-bold text-primary-600 dark:text-primary-400">{{ calculatedTotalQuantity }}</span>
            </div>
          </div>
          <ProductListEditor
            :items="form.products"
            @change="handleProductsChange"
            @add="handleAddProduct"
            @remove="handleRemoveProduct"
            @create="showQuickProductCreate = true"
          />
        </div>

        <!-- Section: Process Configuration -->
        <div>
          <SectionDivider title="工序配置" />
          <ProcessSelector
            v-model="form.process_ids"
          />
        </div>

        <!-- Section: Materials -->
        <div>
          <SectionDivider title="物料清单" />
          <MaterialListEditor
            :items="form.materials"
            :materials="materialList"
            @change="handleMaterialsChange"
            @add="handleAddMaterial"
            @remove="handleRemoveMaterial"
            @create="openQuickMaterialCreate"
          />
        </div>

        <!-- Section: Prepress Resources -->
        <div>
          <SectionDivider title="印前资源" />
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              v-model="form.printing_type"
              :options="printingTypeOptions"
              label="印刷形式"
              placeholder="请选择印刷形式"
              clearable
            />
          </div>
          <div
            v-if="form.printing_type && form.printing_type !== 'none'"
            class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2"
          >
            <MultiSelect
              v-model="form.artwork_ids"
              :options="artworkOptions"
              label="图稿"
              placeholder="选择图稿（可多选）"
              :loading="artworkLoading"
            />
            <div class="space-y-2">
              <label class="input-label block text-sm text-gray-600 dark:text-gray-400">CMYK颜色</label>
              <CheckboxGroup
                v-model="form.printing_cmyk"
                :options="cmykOptions"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            <MultiSelect
              v-model="form.die_ids"
              :options="dieOptions"
              label="刀模"
              placeholder="选择刀模（可多选）"
              :loading="dieLoading"
            />
            <MultiSelect
              v-model="form.foiling_plate_ids"
              :options="foilingPlateOptions"
              label="烫金版"
              placeholder="选择烫金版（可多选）"
              :loading="foilingPlateLoading"
            />
          </div>
          <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            <MultiSelect
              v-model="form.embossing_plate_ids"
              :options="embossingPlateOptions"
              label="压凸版"
              placeholder="选择压凸版（可多选）"
              :loading="embossingPlateLoading"
            />
          </div>
        </div>
      </div>

      <!-- Submit Approval Dialog -->
      <ConfirmDialog
        :show="showSubmitApprovalDialog"
        title="保存成功"
        message="是否立即提交审核？"
        confirm-text="立即提交"
        cancel-text="稍后处理"
        :loading="submitting"
        @confirm="confirmSubmitApproval"
        @cancel="cancelSubmitApproval"
      />

      <!-- Quick Create Dialogs -->
      <QuickCustomerCreateDialog
        v-model:visible="showQuickCustomerCreate"
        @created="handleCustomerCreated"
      />
      <QuickProductCreateDialog
        v-model:visible="showQuickProductCreate"
        @created="handleProductCreated"
      />
      <QuickMaterialCreateDialog
        v-model:visible="showQuickMaterialCreate"
        @created="handleMaterialCreated"
      />
    </div>

    <!-- Action Buttons -->
    <div class="work-order-form-actions fixed bottom-0 left-4 right-4 z-20 rounded-t-xl border border-b-0 border-gray-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-dark-700 dark:bg-dark-900/95 md:left-6 md:right-6 lg:left-[calc(16rem+2rem)] lg:right-8">
      <div class="flex flex-row gap-3 sm:justify-end">
        <button
          class="btn btn-secondary btn-icon shrink-0"
          aria-label="返回"
          title="返回"
          @click="handleCancel"
        >
          <Icon
            name="arrowLeft"
            size="md"
          />
        </button>
        <button
          class="btn btn-secondary min-w-0 flex-1 sm:flex-none"
          :disabled="saving || submitting"
          @click="handleSave(false)"
        >
          <span
            v-if="saving"
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
          :disabled="saving || submitting"
          @click="handleSave(true)"
        >
          <span
            v-if="saving || submitting"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon, Input, TextArea, InputNumber, Select, CheckboxGroup, SectionDivider } from '@/components/common'
import { useUIStore } from '@/stores/ui'
import { workOrderAPI, productAPI, materialAPI, artworkAPI, dieAPI, foilingPlateAPI, embossingPlateAPI, salesOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

import { ProductListEditor, ProcessSelector, MaterialListEditor, MultiSelect } from '@/components/workorder'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import CustomerSelector from '@/views/customer/components/CustomerSelector.vue'
import QuickCustomerCreateDialog from './components/QuickCustomerCreateDialog.vue'
import QuickProductCreateDialog from './components/QuickProductCreateDialog.vue'
import QuickMaterialCreateDialog from '@/views/material/components/QuickMaterialCreateDialog.vue'

const router = useRouter()
const route = useRoute()

const id = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => !!id.value && id.value !== 'create')

const saving = ref(false)
const submitting = ref(false)
const showSubmitApprovalDialog = ref(false)
const showQuickCustomerCreate = ref(false)
const showQuickProductCreate = ref(false)
const showQuickMaterialCreate = ref(false)
const pendingMaterialCreateIndex = ref<number | null>(null)

const customerSelectorRef = ref<any>(null)

// Lists for dropdown options
const salesOrderList = ref<any[]>([])
const productList = ref<any[]>([])
const materialList = ref<any[]>([])
const artworkList = ref<any[]>([])
const dieList = ref<any[]>([])
const foilingPlateList = ref<any[]>([])
const embossingPlateList = ref<any[]>([])

// Loading states
const artworkLoading = ref(false)
const dieLoading = ref(false)
const foilingPlateLoading = ref(false)
const embossingPlateLoading = ref(false)

// Options
const priorityOptions = [
  { value: 'low', label: '低' },
  { value: 'normal', label: '普通' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' }
]

const statusOptions = [
  { value: 'pending', label: '待开始' },
  { value: 'in_progress', label: '进行中' },
  { value: 'paused', label: '已暂停' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

const printingTypeOptions = [
  { value: 'none', label: '不需要印刷' },
  { value: 'front', label: '正面印刷' },
  { value: 'back', label: '背面印刷' },
  { value: 'self_reverse', label: '自反印刷' },
  { value: 'reverse_gripper', label: '反咬口印刷' },
  { value: 'register', label: '套版印刷' }
]

const cmykOptions = [
  { value: 'C', label: 'C', color: '#00A0E3' },
  { value: 'M', label: 'M', color: '#E4007F' },
  { value: 'Y', label: 'Y', color: '#FDB813' },
  { value: 'K', label: 'K', color: '#1C1C1C' }
]

// Computed options for selectors
const salesOrderOptions = computed(() =>
  salesOrderList.value.map((so: any) => ({
    value: so.id,
    label: `${so.order_number || ''} - ${so.customer_name || ''}`.trim()
  }))
)

const artworkOptions = computed(() =>
  artworkList.value.map((a: any) => ({
    value: a.id,
    label: a.code ? `${a.code} - ${a.name}` : a.name
  }))
)

const dieOptions = computed(() =>
  dieList.value.map((d: any) => ({
    value: d.id,
    label: d.code ? `${d.name} (${d.code})` : d.name
  }))
)

const foilingPlateOptions = computed(() =>
  foilingPlateList.value.map((f: any) => ({
    value: f.id,
    label: f.code ? `${f.name} (${f.code})` : f.name
  }))
)

const embossingPlateOptions = computed(() =>
  embossingPlateList.value.map((e: any) => ({
    value: e.id,
    label: e.code ? `${e.name} (${e.code})` : e.name
  }))
)

// Form data
const form = reactive({
  sales_order_id: undefined as number | undefined,
  customer_id: undefined as number | undefined,
  status: 'pending',
  priority: 'normal',
  order_date: '',
  delivery_date: '',
  production_quantity: 1,
  defective_quantity: 0,
  actual_delivery_date: '',
  notes: '',
  products: [] as any[],
  process_ids: [] as number[],
  materials: [] as any[],
  printing_type: 'none',
  printing_cmyk: [] as string[],
  artwork_ids: [] as number[],
  die_ids: [] as number[],
  foiling_plate_ids: [] as number[],
  embossing_plate_ids: [] as number[]
})

// Track created work order ID for submit approval
let createdWorkOrderId: number | null = null

// Calculate total quantity
const calculatedTotalQuantity = computed(() => {
  return form.products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

// Auto-fill production quantity when products change
watch(calculatedTotalQuantity, (newTotal) => {
  if (newTotal > 0) {
    form.production_quantity = newTotal
  }
})

// Load initial data
onMounted(async () => {
  await Promise.all([
    loadSalesOrders(),
    loadProducts(),
    loadMaterials(),
    loadArtworks(),
    loadDies(),
    loadFoilingPlates(),
    loadEmbossingPlates()
  ])

  if (isEdit.value && id.value) {
    await loadDetail(id.value)
  } else {
    // Default dates for new work order
    const today = new Date()
    form.order_date = today.toISOString().split('T')[0]
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    form.delivery_date = nextWeek.toISOString().split('T')[0]
    handleAddProduct()
    handleAddMaterial()

    // Pre-fill from sales order if navigated with ?sales_order_id=X
    const querySalesOrderId = route.query.sales_order_id
    if (querySalesOrderId) {
      await prefillFromSalesOrder(Number(querySalesOrderId))
    }
  }
})

const loadSalesOrders = async () => {
  try {
    const res: any = await workOrderAPI.getSalesOrderCandidates()
    salesOrderList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  }
}

const loadProducts = async () => {
  try {
    const res: any = await productAPI.getList({ page_size: 50 })
    productList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  }
}

const loadMaterials = async () => {
  try {
    const res: any = await materialAPI.getList({ page_size: 50 })
    materialList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  }
}

const loadArtworks = async () => {
  artworkLoading.value = true
  try {
    const res: any = await artworkAPI.getList({ page_size: 50 })
    artworkList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    artworkLoading.value = false
  }
}

const loadDies = async () => {
  dieLoading.value = true
  try {
    const res: any = await dieAPI.getList({ page_size: 50 })
    dieList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    dieLoading.value = false
  }
}

const loadFoilingPlates = async () => {
  foilingPlateLoading.value = true
  try {
    const res: any = await foilingPlateAPI.getList({ page_size: 50 })
    foilingPlateList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    foilingPlateLoading.value = false
  }
}

const loadEmbossingPlates = async () => {
  embossingPlateLoading.value = true
  try {
    const res: any = await embossingPlateAPI.getList({ page_size: 50 })
    embossingPlateList.value = res?.results || res || []
  } catch (error: any) {
    ErrorHandler.handle(error)
  } finally {
    embossingPlateLoading.value = false
  }
}

const loadDetail = async (workOrderId: string) => {
  try {
    const res: any = await workOrderAPI.getDetail(workOrderId)
    Object.assign(form, {
      sales_order_id: res.sales_order_id || undefined,
      customer_id: res.customer?.id || res.customer,
      status: res.status || 'pending',
      priority: res.priority || 'normal',
      order_date: res.order_date ? res.order_date.split('T')[0] : '',
      delivery_date: res.delivery_date ? res.delivery_date.split('T')[0] : '',
      production_quantity: res.production_quantity || 1,
      defective_quantity: res.defective_quantity || 0,
      actual_delivery_date: res.actual_delivery_date ? res.actual_delivery_date.split('T')[0] : '',
      notes: res.notes || '',
      process_ids: res.process_ids || [],
      printing_type: res.printing_type || 'none',
      printing_cmyk: res.printing_cmyk || [],
      artwork_ids: res.artwork_ids || [],
      die_ids: res.die_ids || [],
      foiling_plate_ids: res.foiling_plate_ids || [],
      embossing_plate_ids: res.embossing_plate_ids || []
    })

    // Load products
    if (res.products && Array.isArray(res.products)) {
      form.products = res.products.map((p: any) => ({
        product: p.product?.id || p.product,
        quantity: p.quantity || 1,
        unit: p.unit || '件',
        specification: p.specification || '',
        source_type: p.source_type || 'stock',
        sales_order_item: p.sales_order_item || undefined,
        sort_order: p.sort_order || 0
      }))
    }

    // Load materials
    if (res.materials && Array.isArray(res.materials)) {
      form.materials = res.materials.map((m: any) => ({
        material: m.material?.id || m.material,
        quantity: m.quantity || 1,
        material_size: m.material_size || '',
        material_usage: m.material_usage || '',
        need_cutting: !!m.need_cutting,
        notes: m.notes || ''
      }))
    }
  } catch {
    useUIStore().showError('加载详情失败')
  }
}

// Pre-fill form from sales order (used when navigating with ?sales_order_id=X)
const prefillFromSalesOrder = async (salesOrderId: number) => {
  try {
    const res: any = await salesOrderAPI.getDetail(String(salesOrderId))
    form.sales_order_id = res.id
    if (res.customer) form.customer_id = typeof res.customer === 'object' ? res.customer.id : res.customer
    if (res.order_date) form.order_date = res.order_date.split('T')[0]
    if (res.delivery_date) form.delivery_date = res.delivery_date.split('T')[0]
    if (res.notes) form.notes = res.notes

    // Pre-fill products from sales order items
    if (res.items && res.items.length > 0) {
      form.products = res.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity || 1,
        unit: item.unit || '件',
        specification: item.specification || '',
        sales_order_item: item.id
      }))
    }
  } catch (error: any) {
    ErrorHandler.handle(error)
  }
}

// Handlers
const handleSalesOrderChange = async (value: any) => {
  if (!value) {
    form.sales_order_id = undefined
    return
  }

  const selected = salesOrderList.value.find((so: any) => so.id === value)
  if (selected) {
    form.sales_order_id = selected.id
    // Auto-fill customer and dates from sales order
    if (selected.customer_id) {
      form.customer_id = selected.customer_id
    }
    if (selected.order_date) {
      form.order_date = selected.order_date.split('T')[0]
    }
    if (selected.delivery_date) {
      form.delivery_date = selected.delivery_date.split('T')[0]
    }
  }

  // Fetch full detail to pre-fill products
  try {
    const detail: any = await salesOrderAPI.getDetail(String(value))
    if (detail.items && detail.items.length > 0) {
      form.products = detail.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity || 1,
        unit: item.unit || '件',
        specification: item.specification || '',
        sales_order_item: item.id
      }))
    }
    if (detail.notes) {
      form.notes = detail.notes
    }
  } catch {
    // Silently ignore — basic info already filled from candidate list
  }
}

const handleProductsChange = (newItems: any[]) => {
  form.products = newItems
}

const handleAddProduct = () => {
  form.products.push({ product: null, quantity: 1, unit: '件' })
}

const handleRemoveProduct = (index: number) => {
  form.products.splice(index, 1)
}

const handleMaterialsChange = (newItems: any[]) => {
  form.materials = newItems
}

const handleAddMaterial = () => {
  form.materials.push({ material: null, quantity: 1, notes: '' })
}

const handleRemoveMaterial = (index: number) => {
  form.materials.splice(index, 1)
}

const handleCustomerCreated = (customer: any) => {
  customerSelectorRef.value?.appendCustomer(customer)
  form.customer_id = customer.id
}

const openQuickMaterialCreate = (index: number | null = null) => {
  pendingMaterialCreateIndex.value = typeof index === 'number' ? index : null
  showQuickMaterialCreate.value = true
}

const handleProductCreated = (product: any) => {
  productList.value.push(product)
}

const handleMaterialCreated = (material: any) => {
  materialList.value.push(material)
  if (pendingMaterialCreateIndex.value !== null && form.materials[pendingMaterialCreateIndex.value]) {
    form.materials[pendingMaterialCreateIndex.value].material = material.id
  }
  pendingMaterialCreateIndex.value = null
}

// Validation
const validateForm = () => {
  if (!form.customer_id) {
    useUIStore().showWarning('请选择客户')
    return false
  }
  if (!form.delivery_date) {
    useUIStore().showWarning('请选择交货日期')
    return false
  }
  if (form.order_date && form.delivery_date && new Date(form.delivery_date) < new Date(form.order_date)) {
    useUIStore().showWarning('交货日期不能早于下单日期')
    return false
  }
  if ((Number(form.production_quantity) || 0) <= 0) {
    useUIStore().showWarning('生产数量必须大于 0')
    return false
  }
  if ((Number(form.defective_quantity) || 0) < 0) {
    useUIStore().showWarning('预损数量不能小于 0')
    return false
  }

  // Validate products
  const validProducts = form.products.filter(p => p.product)
  if (validProducts.length === 0) {
    useUIStore().showWarning('请至少添加一个产品')
    return false
  }
  if (validProducts.some(p => (Number(p.quantity) || 0) <= 0)) {
    useUIStore().showWarning('产品数量必须大于 0')
    return false
  }
  if (form.materials.some(m => m.material && (Number(m.quantity) || 0) <= 0)) {
    useUIStore().showWarning('物料数量必须大于 0')
    return false
  }

  return true
}

// Format payload
const formatPayload = () => {
  const payload: any = {
    customer: form.customer_id,
    status: form.status,
    priority: form.priority,
    order_date: form.order_date || undefined,
    delivery_date: form.delivery_date || undefined,
    production_quantity: form.production_quantity,
    defective_quantity: form.defective_quantity || 0,
    actual_delivery_date: form.actual_delivery_date || undefined,
    notes: form.notes?.trim() || undefined,
    processes: form.process_ids,
    printing_type: form.printing_type || 'none',
    printing_cmyk_colors: form.printing_cmyk,
    artworks: form.artwork_ids,
    dies: form.die_ids,
    foiling_plates: form.foiling_plate_ids,
    embossing_plates: form.embossing_plate_ids
  }

  if (form.sales_order_id) {
    payload.sales_order = form.sales_order_id
  }

  // Format products
  payload.products_data = form.products
    .filter(p => p.product)
    .map(p => ({
      product: typeof p.product === 'object' ? p.product.id : p.product,
      quantity: Number(p.quantity || 0),
      unit: p.unit || '件',
      specification: p.specification || '',
      source_type: p.source_type || 'stock',
      sales_order_item: p.sales_order_item || undefined,
      sort_order: p.sort_order || 0
    }))

  // Format materials
  payload.materials_data = form.materials
    .filter(m => m.material)
    .map(m => ({
      material: typeof m.material === 'object' ? m.material.id : m.material,
      material_size: m.material_size || m.size || '',
      material_usage: m.material_usage || m.usage || '',
      need_cutting: !!m.need_cutting,
      notes: m.notes?.trim() || undefined
    }))

  return payload
}

// Save
const handleSave = async (autoApprove: boolean = false) => {
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = formatPayload()
    let currentId = id.value

    if (isEdit.value) {
      await workOrderAPI.update(currentId!, payload)
      useUIStore().showSuccess('施工单更新成功')
    } else {
      const res: any = await workOrderAPI.create(payload)
      currentId = res.id || res.data?.id
      createdWorkOrderId = currentId
      useUIStore().showSuccess('施工单创建成功')
    }

    if (autoApprove && currentId) {
      await workOrderFlowAPI.submitApproval(currentId, { auto_approve: true })
      useUIStore().showSuccess('发布成功')
      router.back()
    } else {
      // Show submit approval dialog for new work orders in draft/pending status if not auto-approved
      if (!isEdit.value && (form.status === 'pending' || form.status === 'draft')) {
        showSubmitApprovalDialog.value = true
      } else {
        router.back()
      }
    }
  } catch (e: any) {
    ErrorHandler.showMessage(e, '保存失败')
  } finally {
    saving.value = false
  }
}

// Submit for approval (edit mode)
const handleSubmitForApproval = async () => {
  if (!isEdit.value) {
    useUIStore().showWarning('请先保存施工单')
    return
  }

  submitting.value = true
  try {
    // First save any changes
    const payload = formatPayload()
    await workOrderAPI.update(id.value!, payload)

    // Then submit for approval
    await workOrderAPI.submitApproval(id.value!, {})
    useUIStore().showSuccess('施工单已提交审核')
    router.push('/workorders')
  } catch (e: any) {
    ErrorHandler.showMessage(e, '提交失败')
  } finally {
    submitting.value = false
  }
}

// Confirm submit approval from dialog
const confirmSubmitApproval = async () => {
  if (!createdWorkOrderId) {
    showSubmitApprovalDialog.value = false
    router.back()
    return
  }

  submitting.value = true
  try {
    await workOrderAPI.submitApproval(createdWorkOrderId, {})
    useUIStore().showSuccess('已保存并提交审核')
    showSubmitApprovalDialog.value = false
    router.push('/workorders')
  } catch (e: any) {
    ErrorHandler.showMessage(e, '提交审核失败')
    submitting.value = false
  }
}

// Cancel submit approval
const cancelSubmitApproval = () => {
  showSubmitApprovalDialog.value = false
  router.back()
}

const handleCancel = () => {
  router.back()
}
</script>
