<template>
  <BaseDialog
    :show="dialogVisible"
    :title="dialogTitle"
    width="narrow"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">产品名称</label>
        <input
          :value="stock?.product_name"
          disabled
          class="input flex-1"
        >
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">批次号</label>
        <input
          :value="stock?.batch_no"
          disabled
          class="input flex-1"
        >
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">当前库存</label>
        <input
          :value="stock?.quantity"
          disabled
          class="input flex-1"
        >
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">调整类型</label>
        <RadioGroup
          v-model="form.adjust_type"
          :options="adjustTypeOptions"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">调整数量</label>
        <InputNumber
          v-model="form.quantity"
          :min="0"
          :precision="2"
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">调整后库存</label>
        <div class="flex-1 flex items-center">
          <input
            :value="previewQuantity"
            disabled
            class="input flex-1"
          >
          <span class="ml-2 text-success-600">{{ previewQuantity }}</span>
        </div>
      </div>
      <TextArea
        v-model="form.reason"
        label="调整原因"
        :rows="2"
        placeholder="请输入调整原因"
        class="w-full"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        @click="handleClose"
      >
        取消
      </button><button
        class="btn btn-primary"
        :disabled="loading"
        @click="handleSubmit"
      >
        确定
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { TextArea, InputNumber, RadioGroup } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, stock: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const form = reactive({ adjust_type: 'add', quantity: 0, reason: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const dialogTitle = computed(() => props.stock ? '库存调整' : '库存调整')
const adjustTypeOptions = [
  { value: 'add', label: '增加' },
  { value: 'subtract', label: '减少' },
  { value: 'set', label: '设置为' }
]
const previewQuantity = computed(() => {
  const current = props.stock?.quantity || 0
  if (form.adjust_type === 'add') return current + form.quantity
  if (form.adjust_type === 'subtract') return Math.max(0, current - form.quantity)
  return form.quantity
})
const handleSubmit = () => { if (!form.quantity) return; emit('submit', { ...form }) }
const handleClose = () => { Object.assign(form, { adjust_type: 'add', quantity: 0, reason: '' }) }
</script>
