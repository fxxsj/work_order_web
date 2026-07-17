<template>
  <div class="pb-32 sm:pb-24">
    <div class="card">
      <div class="card-body space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="input-label mb-1.5 block">供应商</label>
            <SupplierSelector
              :model-value="form.supplier"
              :suppliers="supplierOptions"
              @update:model-value="value => form.supplier = value"
              @create="showQuickSupplierCreate = true"
            />
          </div>
          <div>
            <label class="input-label mb-1.5 block">关联施工单</label>
            <Select
              v-model="form.work_order"
              :options="workOrderSelectOptions"
              placeholder="请选择施工单"
              clearable
              searchable
              class="w-full"
              @change="handleWorkOrderChange"
            />
          </div>
        </div>

        <TextArea
          v-model="form.notes"
          label="备注"
          :rows="2"
          placeholder="请输入备注"
        />

        <SectionDivider title="采购明细" />
        <div>
          <button
            class="btn btn-sm btn-primary"
            @click="handleAddItem"
          >
            <Icon
              name="plus"
              class="h-3 w-3"
            />
            添加明细
          </button>
        </div>

        <div class="w-full overflow-x-auto">
          <LineItemsTable
            :columns="lineItemColumns"
            :items="form.items"
            @delete="handleDeleteItem"
          >
            <template #cell-material="{ row, index }">
              <MaterialSelector
                :model-value="row.material"
                :materials="materialOptions"
                @update:model-value="value => handleMaterialChange(row, value)"
                @create="openQuickMaterialCreate(index)"
              />
            </template>
            <template #cell-quantity="{ row }">
              <InputNumber
                v-model="row.quantity"
                :min="1"
                :precision="2"
                class="w-full"
              />
            </template>
            <template #cell-unit_price="{ row }">
              <InputNumber
                v-model="row.unit_price"
                :min="0"
                :precision="2"
                class="w-full"
              />
            </template>
            <template #cell-subtotal="{ row }">
              <span class="text-right">¥{{ ((row.quantity || 0) * (row.unit_price || 0)).toFixed(2) }}</span>
            </template>
          </LineItemsTable>
        </div>

        <div
          v-if="form.items.length > 0"
          class="text-right text-sm"
        >
          <span>合计金额：</span>
          <span class="text-lg font-bold text-danger-600">¥{{ totalAmount }}</span>
        </div>
      </div>
    </div>

    <div class="fixed bottom-0 left-4 right-4 z-20 rounded-t-xl border border-b-0 border-gray-100 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-dark-700 dark:bg-dark-900/95 md:left-6 md:right-6 lg:left-[calc(16rem+2rem)] lg:right-8">
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
          存为草稿
        </button>
        <button
          v-if="purchaseorderApprovalEnabled"
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
          直接发布
        </button>
      </div>
    </div>

    <QuickSupplierCreateDialog
      v-model:visible="showQuickSupplierCreate"
      @created="handleSupplierCreated"
    />
    <QuickMaterialCreateDialog
      v-model:visible="showQuickMaterialCreate"
      @created="handleMaterialCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon, InputNumber, LineItemsTable, SectionDivider, Select, TextArea } from '@/components/common'
import type { Column } from '@/components/common/types'
import { materialAPI, purchaseOrderAPI, supplierAPI, workOrderAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'
import { useApprovalConfigStore } from '@/stores/approvalConfig'
import ErrorHandler from '@/utils/errorHandler'
import QuickSupplierCreateDialog from './components/QuickSupplierCreateDialog.vue'
import MaterialSelector from '@/views/material/components/MaterialSelector.vue'
import QuickMaterialCreateDialog from '@/views/material/components/QuickMaterialCreateDialog.vue'
import SupplierSelector from '@/views/supplier/components/SupplierSelector.vue'

const router = useRouter()
const approvalConfigStore = useApprovalConfigStore()
const purchaseorderApprovalEnabled = computed(() => approvalConfigStore.isEnabled('purchaseorder'))

const submitting = ref(false)
const showQuickSupplierCreate = ref(false)
const showQuickMaterialCreate = ref(false)
const pendingMaterialCreateIndex = ref<number | null>(null)
const supplierOptions = ref<any[]>([])
const materialOptions = ref<any[]>([])
const workOrderOptions = ref<any[]>([])

const form = reactive({
  supplier: null as any,
  work_order: null as any,
  work_order_number: '',
  notes: '',
  items: [] as any[]
})

const workOrderSelectOptions = computed(() => workOrderOptions.value.map((item: any) => ({ value: item.id, label: item.order_number })))

const totalAmount = computed(() => form.items.reduce((sum: any, item: any) => sum + (item.quantity || 0) * (item.unit_price || 0), 0).toFixed(2))

const lineItemColumns: Column[] = [
  { key: 'material', label: '物料', width: 250 },
  { key: 'quantity', label: '采购数量', width: 150 },
  { key: 'unit_price', label: '单价', width: 150 },
  { key: 'subtotal', label: '小计', width: 120, align: 'right' },
]

const fetchOptions = async () => {
  try {
    const [supplierRes, materialRes, workOrderRes] = await Promise.all([
      supplierAPI.getList({ page_size: 50, status: 'active' }),
      materialAPI.getList({ page_size: 50 }),
      workOrderAPI.getList({ page_size: 50, ordering: '-created_at', approval_status: 'approved' })
    ])
    supplierOptions.value = (supplierRes as any)?.results || []
    materialOptions.value = (materialRes as any)?.results || []
    workOrderOptions.value = ((workOrderRes as any)?.results || []).filter((order: any) => !['completed', 'cancelled'].includes(order.status))
  } catch (error: any) {
    ErrorHandler.showMessage(error, '获取选项数据')
  }
}

const handleWorkOrderChange = (value: any) => {
  const selected = workOrderOptions.value.find((item: any) => item.id === value)
  form.work_order_number = selected ? selected.order_number : ''
}

const handleAddItem = () => {
  form.items.push({ material: null, quantity: 1, unit_price: 0 })
}

const handleDeleteItem = (index: number) => {
  form.items.splice(index, 1)
}

const handleMaterialChange = (row: any, value: any) => {
  row.material = value
  const material = materialOptions.value.find((item: any) => item.id === row.material)
  if (material?.unit_price) row.unit_price = material.unit_price
}

const openQuickMaterialCreate = (index: number | null = null) => {
  pendingMaterialCreateIndex.value = typeof index === 'number' ? index : null
  showQuickMaterialCreate.value = true
}

const validateForm = () => {
  if (!form.supplier) {
    ErrorHandler.showWarning('请选择供应商')
    return false
  }
  if (!form.items.length) {
    ErrorHandler.showWarning('请至少添加一条采购明细')
    return false
  }
  if (form.items.some((item: any) => !item.material)) {
    ErrorHandler.showWarning('请选择所有明细的物料')
    return false
  }
  if (form.items.some((item: any) => Number(item.quantity || 0) <= 0)) {
    ErrorHandler.showWarning('采购数量必须大于 0')
    return false
  }
  if (form.items.some((item: any) => Number(item.unit_price || 0) < 0)) {
    ErrorHandler.showWarning('单价不能为负数')
    return false
  }
  return true
}

const handleSubmit = async (autoApprove: boolean = false) => {
  if (!validateForm()) return

  submitting.value = true
  try {
    const res: any = await purchaseOrderAPI.create({
      supplier: form.supplier,
      work_order: form.work_order,
      notes: form.notes.trim(),
      items_data: form.items.map((item: any) => ({
        material: item.material,
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price || 0),
        work_order_material: item.work_order_material || undefined
      }))
    })
    
    let currentId = res.id
    if (autoApprove && currentId) {
      await purchaseOrderAPI.submit(currentId, { auto_approve: true })
      useUIStore().showSuccess('发布成功')
    } else {
      useUIStore().showSuccess('创建成功')
    }
    
    router.push('/purchase-orders')
  } catch (error: any) {
    ErrorHandler.showMessage(error, '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/purchase-orders')
}

const handleSupplierCreated = (supplier: any) => {
  supplierOptions.value.push(supplier)
  form.supplier = supplier.id
}

const handleMaterialCreated = (material: any) => {
  materialOptions.value.push(material)
  if (pendingMaterialCreateIndex.value !== null && form.items[pendingMaterialCreateIndex.value]) {
    handleMaterialChange(form.items[pendingMaterialCreateIndex.value], material.id)
  }
  pendingMaterialCreateIndex.value = null
}

onMounted(async () => {
  await fetchOptions()
  handleAddItem()
})
</script>
