<template>
  <div class="work-order-form-page pb-32 sm:pb-24">
    <!-- Real-time validation hints -->
    <div
      v-if="formWarnings.length > 0"
      class="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20"
    >
      <div class="mb-2 flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>以下信息待完善（{{ formWarnings.length }}项）</span>
      </div>
      <ul class="ml-7 list-disc space-y-0.5 text-sm text-amber-700 dark:text-amber-300/80">
        <li v-for="(warning, index) in formWarnings" :key="index">{{ warning }}</li>
      </ul>
    </div>
    <div class="card">
      <div class="card-body space-y-4">
        <!-- Section: Basic Info -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Customer Selector with Quick Create -->
          <CustomerSelector
            ref="customerSelectorRef"
            v-model="form.customer_id"
            label="客户"
            required
            @create="showQuickCustomerCreate = true"
            @update:model-value="handleCustomerChange"
          />
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
            label="生产数量（车次）"
            class="w-full"
          />
          <!-- Defective Quantity -->
          <InputNumber
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
            @product-selected="handleProductSelected"
          />
        </div>

        <!-- Section: Process Configuration -->
        <div>
          <SectionDivider title="工序配置" />
          <div class="mb-2 text-sm text-gray-500 dark:text-gray-400">
            选择产品后自动填充默认工序，可根据需要调整
          </div>
          <ProcessSelector
            v-model="form.process_ids"
            :process-list="processList"
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
          <div class="mb-2 text-sm text-gray-500 dark:text-gray-400">
            根据所选工序显示相关资源
          </div>
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
            <div class="space-y-3">
              <div class="space-y-2">
                <label class="input-label block text-sm text-gray-600 dark:text-gray-400">CMYK颜色</label>
                <CheckboxGroup
                  v-model="form.printing_cmyk"
                  :options="cmykOptions"
                />
              </div>
              <Input
                v-model="form.printing_other_colors"
                label="其他颜色（专色）"
                placeholder="如：877C, 金色（逗号分隔）"
              />
            </div>
          </div>
          <div
            v-if="requiredResources.die"
            class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2"
          >
            <MultiSelect
              v-model="form.die_ids"
              :options="dieOptions"
              label="刀模"
              placeholder="选择刀模（可多选）"
              :loading="dieLoading"
            />
          </div>
          <div
            v-if="requiredResources.foilingPlate"
            class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2"
          >
            <MultiSelect
              v-model="form.foiling_plate_ids"
              :options="foilingPlateOptions"
              label="烫金版"
              placeholder="选择烫金版（可多选）"
              :loading="foilingPlateLoading"
            />
          </div>
          <div
            v-if="requiredResources.embossingPlate"
            class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2"
          >
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

      <!-- Process Difference Dialog -->
      <ConfirmDialog
        :show="showProcessDiffDialog"
        title="工序配置不一致"
        message="当前工序与产品默认工序不一致，是否继续提交？"
        confirm-text="继续提交"
        cancel-text="取消"
        @confirm="handleProcessDiffConfirm"
        @cancel="showProcessDiffDialog = false"
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
import { workOrderAPI, productAPI, processAPI, materialAPI, artworkAPI, dieAPI, foilingPlateAPI, embossingPlateAPI, salesOrderAPI } from '@/api/modules'
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
const showProcessDiffDialog = ref(false)
const pendingAutoApprove = ref(false)

const customerSelectorRef = ref<any>(null)

// Lists for dropdown options
const salesOrderList = ref<any[]>([])
const productList = ref<any[]>([])
const processList = ref<any[]>([])
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
const salesOrderOptions = computed(() => {
  const list = form.customer_id
    ? salesOrderList.value.filter((so: any) => so.customer === form.customer_id)
    : salesOrderList.value
  return list.map((so: any) => ({
    value: so.id,
    label: `${so.order_number || ''} - ${so.customer_name || ''}`.trim()
  }))
})

// Computed: artworks filtered by selected products
const selectedProductIds = computed(() => {
  const ids = new Set<number>()
  for (const p of form.products) {
    const productId = typeof p.product === 'object' ? p.product?.id : p.product
    if (productId) ids.add(productId)
  }
  return ids
})

const artworkOptions = computed(() => {
  const productIds = selectedProductIds.value
  // If products selected, only show artworks that contain at least one of them
  const filtered = productIds.size > 0
    ? artworkList.value.filter((a: any) => {
        if (!a.products || a.products.length === 0) return true
        return a.products.some((ap: any) => productIds.has(ap.product))
      })
    : artworkList.value
  return filtered.map((a: any) => {
    const productNames = (a.products || [])
      .filter((ap: any) => productIds.size === 0 || productIds.has(ap.product))
      .map((ap: any) => ap.product_name || '')
      .filter(Boolean)
    const suffix = productNames.length > 0 ? ` (${productNames.join(', ')})` : ''
    return {
      value: a.id,
      label: a.code ? `${a.code} - ${a.name}${suffix}` : `${a.name}${suffix}`,
    }
  })
})

const dieOptions = computed(() => {
  const productIds = selectedProductIds.value
  const filtered = productIds.size > 0
    ? dieList.value.filter((d: any) => {
        if (!d.products || d.products.length === 0) return true
        return d.products.some((dp: any) => productIds.has(dp.product))
      })
    : dieList.value
  return filtered.map((d: any) => {
    const base = d.code ? `${d.name} (${d.code})` : d.name
    const names = (d.products || []).map((dp: any) => dp.product_name).filter(Boolean)
    const suffix = names.length > 0 ? ` [${names.join(', ')}]` : ''
    return { value: d.id, label: `${base}${suffix}` }
  })
})

const foilingPlateOptions = computed(() => {
  const productIds = selectedProductIds.value
  const filtered = productIds.size > 0
    ? foilingPlateList.value.filter((f: any) => {
        if (!f.products || f.products.length === 0) return true
        return f.products.some((fp: any) => productIds.has(fp.product))
      })
    : foilingPlateList.value
  return filtered.map((f: any) => {
    const base = f.code ? `${f.name} (${f.code})` : f.name
    const names = (f.products || []).map((fp: any) => fp.product_name).filter(Boolean)
    const suffix = names.length > 0 ? ` [${names.join(', ')}]` : ''
    return { value: f.id, label: `${base}${suffix}` }
  })
})

const embossingPlateOptions = computed(() => {
  const productIds = selectedProductIds.value
  const filtered = productIds.size > 0
    ? embossingPlateList.value.filter((e: any) => {
        if (!e.products || e.products.length === 0) return true
        return e.products.some((ep: any) => productIds.has(ep.product))
      })
    : embossingPlateList.value
  return filtered.map((e: any) => {
    const base = e.code ? `${e.name} (${e.code})` : e.name
    const names = (e.products || []).map((ep: any) => ep.product_name).filter(Boolean)
    const suffix = names.length > 0 ? ` [${names.join(', ')}]` : ''
    return { value: e.id, label: `${base}${suffix}` }
  })
})

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
  printing_other_colors: '' as string,
  artwork_ids: [] as number[],
  die_ids: [] as number[],
  foiling_plate_ids: [] as number[],
  embossing_plate_ids: [] as number[]
})

// Track created work order ID for submit approval
let createdWorkOrderId: number | null = null

// Calculate total quantity from products
const calculatedTotalQuantity = computed(() => {
  return form.products.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
})

// Auto-calculate product quantity when production_quantity or imposition changes
watch(() => form.production_quantity, () => {
  recalcProductQuantities()
})

function recalcProductQuantities() {
  for (const p of form.products) {
    if (!p.manual_quantity && p.product) {
      const imposition = p.imposition_quantity || 1
      p.quantity = form.production_quantity * imposition
    }
  }
}

// Collect default process IDs from all selected products
const productDefaultProcessIds = computed(() => {
  const ids = new Set<number>()
  for (const p of form.products) {
    const productId = typeof p.product === 'object' ? p.product?.id : p.product
    if (!productId) continue
    const productData = productList.value.find((pr: any) => pr.id === productId)
    if (productData?.default_processes) {
      for (const id of productData.default_processes) {
        ids.add(typeof id === 'object' ? id.id : id)
      }
    }
  }
  return [...ids]
})

// Track previous default process IDs to detect changes
let prevDefaultProcessIds: number[] = []

// Auto-merge default processes when products change
watch(productDefaultProcessIds, (newIds) => {
  const added = newIds.filter(id => !prevDefaultProcessIds.includes(id))

  for (const id of added) {
    if (!form.process_ids.includes(id)) {
      form.process_ids.push(id)
    }
  }

  prevDefaultProcessIds = [...newIds]
}, { immediate: true })

// Sync materials from product default_materials
function syncMaterialsFromProducts() {
  const existingMaterialIds = new Set(
    form.materials.filter((m: any) => m.material).map((m: any) => m.material)
  )

  for (const p of form.products) {
    const productId = typeof p.product === 'object' ? p.product?.id : p.product
    if (!productId) continue
    const productData = productList.value.find((pr: any) => pr.id === productId)
    if (!productData?.default_materials) continue

    for (const dm of productData.default_materials) {
      const materialId = dm.material?.id || dm.material
      if (!existingMaterialIds.has(materialId)) {
        form.materials.push({
          material: materialId,
          material_size: dm.material_size || '',
          material_usage: dm.material_usage || '',
          need_cutting: dm.need_cutting || false,
          notes: dm.notes || '',
          auto_filled: true,
        })
        existingMaterialIds.add(materialId)
      }
    }
  }
}

// Computed: which prepress resources are needed based on selected processes
const requiredResources = computed(() => {
  const result = { artwork: false, die: false, foilingPlate: false, embossingPlate: false }
  for (const processId of form.process_ids) {
    const process = processList.value.find((p: any) => p.id === processId)
    if (!process) continue
    if (process.requires_artwork) result.artwork = true
    if (process.requires_die) result.die = true
    if (process.requires_foiling_plate) result.foilingPlate = true
    if (process.requires_embossing_plate) result.embossingPlate = true
  }
  return result
})

// Auto-fill CMYK, other colors, and imposition_quantity from selected artworks
watch(() => form.artwork_ids, () => {
  syncColorsFromArtworks()
  syncPrepressFromArtworks()
  syncImpositionFromArtworks()
}, { deep: true })

function syncColorsFromArtworks() {
  const cmykSet = new Set<string>()
  const otherSet = new Set<string>()

  for (const artworkId of form.artwork_ids) {
    const artwork = artworkList.value.find((a: any) => a.id === artworkId)
    if (!artwork) continue
    if (artwork.cmyk_colors) {
      for (const c of artwork.cmyk_colors) cmykSet.add(c)
    }
    if (artwork.other_colors) {
      for (const c of artwork.other_colors) otherSet.add(c)
    }
  }

  // Only auto-fill if user hasn't manually changed colors, or if currently empty
  if (form.printing_cmyk.length === 0 || form.printing_cmyk.every(c => cmykSet.has(c))) {
    form.printing_cmyk = [...cmykSet]
  }
  if (!form.printing_other_colors || form.printing_other_colors.split(',').every(s => otherSet.has(s.trim()))) {
    form.printing_other_colors = [...otherSet].join(', ')
  }
}

// Sync die_ids / foiling_plate_ids / embossing_plate_ids from selected artworks' M2M fields
function syncPrepressFromArtworks() {
  const dieIdSet = new Set<number>(form.die_ids)
  const foilingIdSet = new Set<number>(form.foiling_plate_ids)
  const embossingIdSet = new Set<number>(form.embossing_plate_ids)

  for (const artworkId of form.artwork_ids) {
    const artwork = artworkList.value.find((a: any) => a.id === artworkId)
    if (!artwork) continue
    if (Array.isArray(artwork.dies)) {
      for (const dieId of artwork.dies) {
        dieIdSet.add(dieId)
      }
    }
    if (Array.isArray(artwork.foiling_plates)) {
      for (const fpId of artwork.foiling_plates) {
        foilingIdSet.add(fpId)
      }
    }
    if (Array.isArray(artwork.embossing_plates)) {
      for (const epId of artwork.embossing_plates) {
        embossingIdSet.add(epId)
      }
    }
  }

  form.die_ids = [...dieIdSet]
  form.foiling_plate_ids = [...foilingIdSet]
  form.embossing_plate_ids = [...embossingIdSet]
}

// Update imposition_quantity from artwork-product relationships, then recalc product quantities
function syncImpositionFromArtworks() {
  if (form.artwork_ids.length === 0) return

  for (const productItem of form.products) {
    if (!productItem.product) continue
    const productId = typeof productItem.product === 'object' ? productItem.product?.id : productItem.product
    if (!productId) continue

    // Find the first artwork that has this product and get its imposition_quantity
    for (const artworkId of form.artwork_ids) {
      const artwork = artworkList.value.find((a: any) => a.id === artworkId)
      if (!artwork || !artwork.products) continue
      const ap = artwork.products.find((p: any) => p.product === productId)
      if (ap && ap.imposition_quantity) {
        productItem.imposition_quantity = ap.imposition_quantity
        // Recalculate quantity if user hasn't manually overridden
        if (!productItem.manual_quantity) {
          productItem.quantity = form.production_quantity * ap.imposition_quantity
        }
        break
      }
    }
  }
}

// Load initial data
onMounted(async () => {
  await Promise.all([
    loadSalesOrders(),
    loadProducts(),
    loadProcesses(),
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

const loadProcesses = async () => {
  try {
    const res: any = await processAPI.getList({ is_active: true, page_size: 100 })
    processList.value = res?.results || res || []
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
      printing_other_colors: (res.printing_other_colors || []).join(', '),
      artwork_ids: res.artwork_ids || [],
      die_ids: res.die_ids || [],
      foiling_plate_ids: res.foiling_plate_ids || [],
      embossing_plate_ids: res.embossing_plate_ids || []
    })

    // Load products
    if (res.products && Array.isArray(res.products)) {
      form.products = res.products.map((p: any) => {
        const productId = p.product?.id || p.product
        const productData = productList.value.find((pr: any) => pr.id === productId)
        return {
          product: productId,
          imposition_quantity: p.imposition_quantity || 1,
          quantity: p.quantity || 1,
          unit: productData?.unit || p.unit || '件',
          specification: p.specification || '',
          source_type: p.source_type || 'stock',
          sales_order_item: p.sales_order_item || undefined,
          sort_order: p.sort_order || 0,
          manual_quantity: true, // Edit mode: preserve existing quantities
        }
      })
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
      form.products = res.items.map((item: any) => {
        // Look up product data to get unit and default processes
        const productData = productList.value.find((p: any) => p.id === item.product)
        return {
          product: item.product,
          imposition_quantity: 1,
          quantity: item.quantity || form.production_quantity,
          unit: productData?.unit || item.unit || '件',
          specification: item.specification || '',
          sales_order_item: item.id,
          manual_quantity: false,
        }
      })
      // Sync materials from products
      syncMaterialsFromProducts()
    }
  } catch (error: any) {
    ErrorHandler.handle(error)
  }
}

// Handlers
const handleCustomerChange = () => {
  // Clear sales order if it doesn't belong to the new customer
  if (form.sales_order_id) {
    const so = salesOrderList.value.find((s: any) => s.id === form.sales_order_id)
    if (so && so.customer !== form.customer_id) {
      form.sales_order_id = undefined
    }
  }
}

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
      form.products = detail.items.map((item: any) => {
        const productData = productList.value.find((p: any) => p.id === item.product)
        return {
          product: item.product,
          imposition_quantity: 1,
          quantity: item.quantity || form.production_quantity,
          unit: productData?.unit || item.unit || '件',
          specification: item.specification || '',
          sales_order_item: item.id,
          manual_quantity: false,
        }
      })
      // Sync materials from products
      syncMaterialsFromProducts()
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
  // Recalculate quantities when items change (imposition_quantity may have changed)
  recalcProductQuantities()
  // Clear prepress resources that no longer match the selected products
  cleanupPrepressSelections()
}

function cleanupPrepressSelections() {
  const productIds = selectedProductIds.value
  if (productIds.size === 0) return

  // Clear artworks that don't contain any selected product
  if (form.artwork_ids.length > 0) {
    form.artwork_ids = form.artwork_ids.filter((id: number) => {
      const artwork = artworkList.value.find((a: any) => a.id === id)
      if (!artwork) return false
      if (!artwork.products || artwork.products.length === 0) return true
      return artwork.products.some((ap: any) => productIds.has(ap.product))
    })
  }

  // Clear dies that don't contain any selected product
  if (form.die_ids.length > 0) {
    form.die_ids = form.die_ids.filter((id: number) => {
      const die = dieList.value.find((d: any) => d.id === id)
      if (!die || !die.products || die.products.length === 0) return true
      return die.products.some((dp: any) => productIds.has(dp.product))
    })
  }

  // Clear foiling plates
  if (form.foiling_plate_ids.length > 0) {
    form.foiling_plate_ids = form.foiling_plate_ids.filter((id: number) => {
      const plate = foilingPlateList.value.find((f: any) => f.id === id)
      if (!plate || !plate.products || plate.products.length === 0) return true
      return plate.products.some((fp: any) => productIds.has(fp.product))
    })
  }

  // Clear embossing plates
  if (form.embossing_plate_ids.length > 0) {
    form.embossing_plate_ids = form.embossing_plate_ids.filter((id: number) => {
      const plate = embossingPlateList.value.find((e: any) => e.id === id)
      if (!plate || !plate.products || plate.products.length === 0) return true
      return plate.products.some((ep: any) => productIds.has(ep.product))
    })
  }
}

const handleAddProduct = () => {
  form.products.push({ product: null, imposition_quantity: 1, quantity: form.production_quantity, unit: '件', manual_quantity: false })
}

const handleRemoveProduct = (index: number) => {
  form.products.splice(index, 1)
}

// Handle product selection - auto-fill unit, calculate quantity, sync processes & materials
const handleProductSelected = (index: number, productValue: any) => {
  const productId = typeof productValue === 'object' ? productValue?.id : productValue
  if (!productId) return

  const productData = productList.value.find((p: any) => p.id === productId)
  if (!productData) return

  const item = form.products[index]
  if (!item) return

  // Auto-fill unit from product
  item.unit = productData.unit || '件'

  // Sync imposition from artworks if available (handles case where artwork was selected before product)
  if (form.artwork_ids.length > 0) {
    const productId = typeof item.product === 'object' ? item.product?.id : item.product
    for (const artworkId of form.artwork_ids) {
      const artwork = artworkList.value.find((a: any) => a.id === artworkId)
      if (!artwork || !artwork.products) continue
      const ap = artwork.products.find((p: any) => p.product === productId)
      if (ap && ap.imposition_quantity) {
        item.imposition_quantity = ap.imposition_quantity
        break
      }
    }
  }


  // Auto-calculate quantity based on production_quantity × imposition_quantity
  const imposition = item.imposition_quantity || 1
  item.quantity = form.production_quantity * imposition
  item.manual_quantity = false

  // Sync materials from this product's defaults
  const existingMaterialIds = new Set(
    form.materials.filter((m: any) => m.material).map((m: any) => m.material)
  )
  if (productData.default_materials) {
    for (const dm of productData.default_materials) {
      const materialId = dm.material?.id || dm.material
      if (!existingMaterialIds.has(materialId)) {
        form.materials.push({
          material: materialId,
          material_size: dm.material_size || '',
          material_usage: dm.material_usage || '',
          need_cutting: dm.need_cutting || false,
          notes: dm.notes || '',
          auto_filled: true,
        })
        existingMaterialIds.add(materialId)
      }
    }
  }
}

const handleMaterialsChange = (newItems: any[]) => {
  form.materials = newItems
}

const handleAddMaterial = () => {
  form.materials.push({ material: null, material_size: '', material_usage: '', need_cutting: false, notes: '', auto_filled: false })
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
  const warnings = formWarnings.value
  if (warnings.length > 0) {
    useUIStore().showWarning(warnings.join('；'))
    return false
  }
  return true
}

// Real-time form completeness check
const formWarnings = computed(() => {
  const errors: string[] = []

  // Basic info
  if (!form.customer_id) {
    errors.push('缺少客户信息')
  }
  if (!form.delivery_date) {
    errors.push('缺少交货日期')
  }
  if (form.order_date && form.delivery_date && new Date(form.delivery_date) < new Date(form.order_date)) {
    errors.push('交货日期不能早于下单日期')
  }
  if ((Number(form.production_quantity) || 0) <= 0) {
    errors.push('缺少生产数量')
  }
  if ((Number(form.defective_quantity) || 0) < 0) {
    errors.push('预损数量不能小于 0')
  }

  // Products
  const validProducts = form.products.filter((p: any) => p.product)
  if (validProducts.length === 0) {
    errors.push('缺少产品信息')
  } else {
    const totalQuantity = validProducts.reduce((sum: number, p: any) => sum + (Number(p.quantity) || 0), 0)
    if (totalQuantity <= 0) {
      errors.push('产品数量总和必须大于0')
    }
  }

  // Processes
  if (form.process_ids.length === 0) {
    errors.push('缺少工序信息')
  }

  // Asset-process match
  const selectedProcesses = processList.value.filter((p: any) => form.process_ids.includes(p.id))

  const artworkProcesses = selectedProcesses.filter((p: any) => p.requires_artwork)
  if (artworkProcesses.length > 0 && form.artwork_ids.length === 0) {
    const names = artworkProcesses.map((p: any) => p.name).join(', ')
    errors.push(`选择了需要图稿的工序（${names}），请至少选择一个图稿`)
  }

  const dieProcesses = selectedProcesses.filter((p: any) => p.requires_die)
  if (dieProcesses.length > 0 && form.die_ids.length === 0) {
    const names = dieProcesses.map((p: any) => p.name).join(', ')
    errors.push(`选择了需要刀模的工序（${names}），请至少选择一个刀模`)
  }

  const foilingProcesses = selectedProcesses.filter((p: any) => p.requires_foiling_plate)
  if (foilingProcesses.length > 0 && form.foiling_plate_ids.length === 0) {
    const names = foilingProcesses.map((p: any) => p.name).join(', ')
    errors.push(`选择了需要烫金版的工序（${names}），请至少选择一个烫金版`)
  }

  const embossingProcesses = selectedProcesses.filter((p: any) => p.requires_embossing_plate)
  if (embossingProcesses.length > 0 && form.embossing_plate_ids.length === 0) {
    const names = embossingProcesses.map((p: any) => p.name).join(', ')
    errors.push(`选择了需要压凸版的工序（${names}），请至少选择一个压凸版`)
  }

  // Materials needing cutting
  for (const m of form.materials) {
    if (m.material && m.need_cutting && !m.material_usage) {
      errors.push('需要开料的物料请填写物料用量')
      break
    }
  }

  return errors
})

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
    printing_other_colors: form.printing_other_colors
      ? form.printing_other_colors.split(',').map(s => s.trim()).filter(Boolean)
      : [],
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
      sort_order: p.sort_order || 0,
    }))

  // Format materials
  payload.materials_data = form.materials
    .filter(m => m.material)
    .map(m => ({
      material: typeof m.material === 'object' ? m.material.id : m.material,
      material_size: m.material_size || '',
      material_usage: m.material_usage || '',
      need_cutting: !!m.need_cutting,
      notes: m.notes?.trim() || undefined
    }))

  return payload
}

// Save
const handleSave = async (autoApprove: boolean = false) => {
  if (!validateForm()) return

  // Check process difference with product defaults
  const defaultIds = [...productDefaultProcessIds.value].sort()
  const currentIds = [...form.process_ids].sort()
  const hasDiff = JSON.stringify(defaultIds) !== JSON.stringify(currentIds)
  if (hasDiff && defaultIds.length > 0) {
    pendingAutoApprove.value = autoApprove
    showProcessDiffDialog.value = true
    return
  }

  doSave(autoApprove)
}

const doSave = async (autoApprove: boolean) => {
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
      createdWorkOrderId = currentId ? Number(currentId) : null
      useUIStore().showSuccess('施工单创建成功')
    }

    if (autoApprove && currentId) {
      await workOrderAPI.submitApproval(currentId, { auto_approve: true })
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

// Confirm process diff dialog — proceed with current config
const handleProcessDiffConfirm = () => {
  showProcessDiffDialog.value = false
  doSave(pendingAutoApprove.value)
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
