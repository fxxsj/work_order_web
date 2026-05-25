<template>
  <div>
    <div class="card">
      <div class="card-body space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="input-label mb-1.5 block">供应商</label>
            <Select
              v-model="form.supplier"
              :options="supplierSelectOptions"
              placeholder="请选择供应商"
              searchable
              class="w-full"
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
            <template #cell-material="{ row }">
              <Select
                v-model="row.material"
                :options="materialSelectOptions"
                placeholder="请选择物料"
                searchable
                class="w-full"
                @change="handleMaterialChange(row)"
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
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon, InputNumber, LineItemsTable, SectionDivider, Select, TextArea } from '@/components/common'
import type { Column } from '@/components/common/types'
import { materialAPI, purchaseOrderAPI, supplierAPI, workOrderAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'
import ErrorHandler from '@/utils/errorHandler'

const router = useRouter()

const submitting = ref(false)
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

const supplierSelectOptions = computed(() => supplierOptions.value.map((item: any) => ({ value: item.id, label: item.name })))
const materialSelectOptions = computed(() => materialOptions.value.map((item: any) => ({ value: item.id, label: `${item.code} - ${item.name}` })))
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
      supplierAPI.getList({ page_size: 1000, status: 'active' }),
      materialAPI.getList({ page_size: 1000 }),
      workOrderAPI.getList({ page_size: 1000, ordering: '-created_at', approval_status: 'approved' })
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

const handleMaterialChange = (row: any) => {
  const material = materialOptions.value.find((item: any) => item.id === row.material)
  if (material?.unit_price) row.unit_price = material.unit_price
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
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true
  try {
    await purchaseOrderAPI.create({ ...form })
    useUIStore().showSuccess('创建成功')
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

onMounted(async () => {
  await fetchOptions()
  handleAddItem()
})
</script>
