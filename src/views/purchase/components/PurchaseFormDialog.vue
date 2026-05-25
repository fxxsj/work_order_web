<template>
  <BaseDialog
    :show="dialogVisible"
    :title="isEdit ? '编辑采购订单' : '新建采购订单'"
    width="extra-wide"
    @close="handleClose"
  >
    <div class="space-y-4">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="input-label mb-1.5 block">供应商</label>
          <Select
            v-model="localForm.supplier"
            :options="supplierSelectOptions"
            placeholder="请选择供应商"
            searchable
            class="w-full"
          />
        </div>
        <div>
          <label class="input-label mb-1.5 block">关联施工单</label>
          <Select
            v-model="localForm.work_order"
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
        v-model="localForm.notes"
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
          :items="localForm.items"
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
        v-if="localForm.items.length > 0"
        class="mt-4 text-right text-sm"
      >
        <span>合计金额：</span><span class="text-lg font-bold text-danger-600">¥{{ totalAmount }}</span>
      </div>
    </div>
    <template #footer>
      <button
        class="btn btn-secondary"
        @click="handleClose"
      >
        <Icon
          name="arrowLeft"
          size="md"
        />
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting || loading"
        @click="handleSubmit"
      >
        <Icon
          v-if="!(submitting || loading)"
          name="check"
          size="md"
        />
        {{ submitting || loading ? '提交中...' : '确定' }}
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Icon, Select, TextArea, InputNumber, SectionDivider, LineItemsTable } from '@/components/common'
import { supplierAPI, materialAPI, workOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  visible: { type: Boolean, default: false },
  formData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'close', 'update:visible'])

const loading = ref(false)
const supplierOptions = ref<any[]>([])
const materialOptions = ref<any[]>([])
const workOrderOptions = ref<any[]>([])

const FORM_INITIAL = { supplier: null as any, work_order: null as any, work_order_number: '', notes: '', items: [] as any[] }
const localForm = reactive({ ...FORM_INITIAL, items: [] as any[] })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const totalAmount = computed(() => localForm.items.reduce((sum: any, item: any) => sum + (item.quantity || 0) * (item.unit_price || 0), 0).toFixed(2))

const supplierSelectOptions = computed(() => supplierOptions.value.map((s: any) => ({ value: s.id, label: s.name })))
const materialSelectOptions = computed(() => materialOptions.value.map((m: any) => ({ value: m.id, label: `${m.code} - ${m.name}` })))
const workOrderSelectOptions = computed(() => workOrderOptions.value.map((o: any) => ({ value: o.id, label: o.order_number })))

const lineItemColumns = [
  { key: 'material', label: '物料', width: 250 },
  { key: 'quantity', label: '采购数量', width: 150 },
  { key: 'unit_price', label: '单价', width: 150 },
  { key: 'subtotal', label: '小计', width: 120, align: 'right' as const },
]

watch(() => props.visible, (val: any) => {
  if (val) {
    fetchOptions()
    Object.assign(localForm, {
      ...props.formData,
      items: (props.formData.items || []).map((item: any) => ({ ...item }))
    })
  }
})

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
    syncWorkOrderNumber()
  } catch (error: any) { ErrorHandler.showMessage(error, '获取选项数据') }
}

const handleWorkOrderChange = (value: any) => {
  const selected = workOrderOptions.value.find((item: any) => item.id === value)
  localForm.work_order_number = selected ? selected.order_number : ''
}

const syncWorkOrderNumber = () => {
  if (!localForm.work_order) return
  const selected = workOrderOptions.value.find((item: any) => item.id === localForm.work_order)
  if (selected) localForm.work_order_number = selected.order_number
}

const handleAddItem = () => { localForm.items.push({ material: null, quantity: 1, unit_price: 0 }) }
const handleDeleteItem = (index: any) => { localForm.items.splice(index, 1) }

const handleMaterialChange = (row: any) => {
  const material = materialOptions.value.find((m: any) => m.id === row.material)
  if (material?.unit_price) row.unit_price = material.unit_price
}

const handleSubmit = async () => {
  if (!localForm.supplier) { ErrorHandler.showWarning('请选择供应商'); return }
  if (!localForm.items?.length) { ErrorHandler.showWarning('请至少添加一条采购明细'); return }
  if (localForm.items.find((item: any) => !item.material)) { ErrorHandler.showWarning('请选择所有明细的物料'); return }
  loading.value = true
  try { emit('confirm', { ...localForm }) } finally { loading.value = false }
}

const handleClose = () => {
  Object.assign(localForm, { ...FORM_INITIAL, items: [] })
  emit('update:visible', false)
  emit('close')
}
</script>
