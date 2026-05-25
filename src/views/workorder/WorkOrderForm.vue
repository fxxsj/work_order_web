<template>
  <div>
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
            required
            @create="showQuickCustomerCreate = true"
          />
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Status -->
          <Select
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
            :show-hint="true"
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
            @create="showQuickMaterialCreate = true"
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
              :show-hint="true"
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
              :show-hint="true"
            />
            <MultiSelect
              v-model="form.foiling_plate_ids"
              :options="foilingPlateOptions"
              label="烫金版"
              placeholder="选择烫金版（可多选）"
              :loading="foilingPlateLoading"
              :show-hint="true"
            />
          </div>
          <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
            <MultiSelect
              v-model="form.embossing_plate_ids"
              :options="embossingPlateOptions"
              label="压凸版"
              placeholder="选择压凸版（可多选）"
              :loading="embossingPlateLoading"
              :show-hint="true"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-footer flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          class="btn btn-secondary"
          @click="handleCancel"
        >
          <Icon
            name="arrowLeft"
            size="md"
          />
          取消
        </button>
        <button
          class="btn btn-primary"
          :disabled="saving"
          @click="handleSave"
        >
          <span
            v-if="saving"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-2"
          />
          <Icon
            v-else
            name="check"
            size="md"
          />
          保存
        </button>
        <button
          v-if="isEdit"
          class="btn btn-success"
          :disabled="submitting"
          @click="handleSubmitForApproval"
        >
          <span
            v-if="submitting"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-2"
          />
          <Icon
            v-else
            name="upload"
            size="md"
          />
          提交审核
        </button>
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
        v-model="showQuickCustomerCreate"
        @created="handleCustomerCreated"
      />
      <QuickProductCreateDialog
        v-model="showQuickProductCreate"
        @created="handleProductCreated"
      />
      <QuickMaterialCreateDialog
        v-model="showQuickMaterialCreate"
        @created="handleMaterialCreated"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon, Input, TextArea, InputNumber, Select, CheckboxGroup, SectionDivider } from '@/components/common'
import { useUIStore } from '@/stores/ui'
import { workOrderAPI, productAPI, materialAPI, artworkAPI, dieAPI, foilingPlateAPI, embossingPlateAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

import { CustomerSelector, ProductListEditor, ProcessSelector, MaterialListEditor, MultiSelect } from '@/components/workorder'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import QuickCustomerCreateDialog from './components/QuickCustomerCreateDialog.vue'
import QuickProductCreateDialog from './components/QuickProductCreateDialog.vue'
import QuickMaterialCreateDialog from './components/QuickMaterialCreateDialog.vue'

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
  { value: 'C', label: 'C' },
  { value: 'M', label: 'M' },
  { value: 'Y', label: 'Y' },
  { value: 'K', label: 'K' }
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
    form.order_date = new Date().toISOString().split('T')[0]
    handleAddProduct()
    handleAddMaterial()
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
        unit: p.unit || '件'
      }))
    }

    // Load materials
    if (res.materials && Array.isArray(res.materials)) {
      form.materials = res.materials.map((m: any) => ({
        material: m.material?.id || m.material,
        quantity: m.quantity || 1,
        notes: m.notes || ''
      }))
    }
  } catch {
    useUIStore().showError('加载详情失败')
  }
}

// Handlers
const handleSalesOrderChange = (value: any) => {
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

const handleProductCreated = (product: any) => {
  // Add to product list
  productList.value.push(product)
}

const handleMaterialCreated = (material: any) => {
  // Add to material list
  materialList.value.push(material)
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

  // Validate products
  const validProducts = form.products.filter(p => p.product)
  if (validProducts.length === 0) {
    useUIStore().showWarning('请至少添加一个产品')
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
    notes: form.notes || undefined,
    process_ids: form.process_ids,
    printing_type: form.printing_type || 'none',
    printing_cmyk: form.printing_cmyk,
    artwork_ids: form.artwork_ids,
    die_ids: form.die_ids,
    foiling_plate_ids: form.foiling_plate_ids,
    embossing_plate_ids: form.embossing_plate_ids
  }

  if (form.sales_order_id) {
    payload.sales_order_id = form.sales_order_id
  }

  // Format products
  payload.products_data = form.products
    .filter(p => p.product)
    .map(p => ({
      product_id: typeof p.product === 'object' ? p.product.id : p.product,
      quantity: p.quantity,
      unit: p.unit
    }))

  // Format materials
  payload.materials_data = form.materials
    .filter(m => m.material)
    .map(m => ({
      material_id: typeof m.material === 'object' ? m.material.id : m.material,
      quantity: m.quantity,
      notes: m.notes || undefined
    }))

  return payload
}

// Save
const handleSave = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    const payload = formatPayload()

    if (isEdit.value) {
      await workOrderAPI.update(id.value!, payload)
      useUIStore().showSuccess('施工单更新成功')
      router.back()
    } else {
      const res: any = await workOrderAPI.create(payload)
      createdWorkOrderId = res.id || res.data?.id
      useUIStore().showSuccess('施工单创建成功')

      // Show submit approval dialog for new work orders in draft/pending status
      if (form.status === 'pending' || form.status === 'draft') {
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

