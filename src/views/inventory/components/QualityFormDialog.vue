<template>
  <BaseDialog
    :show="visible"
    title="新建质检"
    width="normal"
    @close="handleClose"
  >
    <div class="space-y-4">
      <Select
        v-model="localForm.product"
        :options="productOptions"
        label="产品"
        placeholder="选择产品"
        clearable
        searchable
      />
      <Input
        v-model="localForm.batch_no"
        label="批次号"
        placeholder="输入批次号"
      />
      <Select
        v-model="localForm.inspection_type"
        :options="inspectionTypeOptions"
        label="检验类型"
      />
      <Input
        v-model="localForm.inspection_date"
        type="date"
        label="检验日期"
      />
      <InputNumber
        v-model="localForm.inspection_quantity"
        label="检验数量"
        :min="0"
        class="w-full"
      />
      <InputNumber
        v-model="localForm.passed_quantity"
        label="合格数量"
        :min="0"
        class="w-full"
      />
      <InputNumber
        v-model="localForm.failed_quantity"
        label="不合格数量"
        :min="0"
        class="w-full"
      />
      <TextArea
        v-model="localForm.inspection_standard"
        label="检验标准"
        :rows="2"
      />
      <TextArea
        v-model="localForm.notes"
        label="备注"
        :rows="3"
      />
      <p
        v-if="errorMessage"
        class="text-sm text-danger"
      >
        {{ errorMessage }}
      </p>
    </div>
    <template #footer>
      <button
        class="btn"
        :disabled="submitting"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交' }}
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { BaseDialog, Input, InputNumber, Select, TextArea } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  form: { type: Object, default: null },
  productList: { type: Array, default: () => [] }
})
const emit = defineEmits(['submit', 'update:visible'])

const visible = computed({
  get: () => props.visible,
  set: (v: boolean) => emit('update:visible', v)
})

const todayText = () => new Date().toISOString().slice(0, 10)
const localForm = reactive({
  product: null as number | null,
  batch_no: '',
  inspection_type: 'final',
  inspection_date: todayText(),
  inspection_quantity: 0,
  passed_quantity: 0,
  failed_quantity: 0,
  inspection_standard: '',
  notes: ''
})
const errorMessage = computed(() => {
  const inspectionQuantity = Number(localForm.inspection_quantity || 0)
  const passedQuantity = Number(localForm.passed_quantity || 0)
  const failedQuantity = Number(localForm.failed_quantity || 0)
  if (passedQuantity + failedQuantity > inspectionQuantity) {
    return '合格数量和不合格数量之和不能超过检验数量'
  }
  return ''
})

const inspectionTypeOptions = [
  { value: 'incoming', label: '来料检验' },
  { value: 'process', label: '过程检验' },
  { value: 'final', label: '成品检验' },
  { value: 'customer', label: '客诉检验' }
]

const productOptions = computed(() => props.productList.map((product: any) => ({
  value: product.id,
  label: product.name || product.code || `产品 #${product.id}`
})))

watch(() => props.visible, (next) => {
  if (!next) return
  Object.assign(localForm, {
    product: props.form?.product ?? null,
    batch_no: props.form?.batch_no ?? '',
    inspection_type: props.form?.inspection_type ?? 'final',
    inspection_date: props.form?.inspection_date ?? todayText(),
    inspection_quantity: props.form?.inspection_quantity ?? props.form?.quantity ?? 0,
    passed_quantity: props.form?.passed_quantity ?? 0,
    failed_quantity: props.form?.failed_quantity ?? 0,
    inspection_standard: props.form?.inspection_standard ?? '',
    notes: props.form?.notes ?? ''
  })
})

const handleClose = () => {
  visible.value = false
}

const handleSubmit = () => {
  if (errorMessage.value) return
  emit('submit', {
    product: localForm.product,
    batch_no: localForm.batch_no.trim(),
    inspection_type: localForm.inspection_type,
    inspection_date: localForm.inspection_date,
    inspection_quantity: Number(localForm.inspection_quantity || 0),
    passed_quantity: Number(localForm.passed_quantity || 0),
    failed_quantity: Number(localForm.failed_quantity || 0),
    inspection_standard: localForm.inspection_standard.trim(),
    notes: localForm.notes.trim()
  })
}
</script>
