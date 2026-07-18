<template>
  <BaseDialog
    :show="dialogVisible"
    title="采购订单收货"
    width="extra-wide"
    @close="handleClose"
  >
    <div class="relative">
      <LoadingOverlay :show="isLoading" />
      <DescriptionGrid
        :columns="3"
        class="mb-4"
      >
        <DescriptionItem label="采购订单号">
          {{ purchaseOrder?.order_number }}
        </DescriptionItem>
        <DescriptionItem label="供应商">
          {{ purchaseOrder?.supplier_name }}
        </DescriptionItem>
        <DescriptionItem label="状态">
          <StatusTag
            :status="purchaseOrder?.status"
            category="purchaseOrder"
            :label="purchaseOrder?.status_display"
          />
        </DescriptionItem>
      </DescriptionGrid>
      <div class="mb-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div class="form-item">
              <label class="form-label">收货日期</label><input
                v-model="form.received_date"
                type="date"
                class="input w-full"
              >
            </div>
          </div>
          <div>
            <Input
              v-model="form.delivery_note_number"
              label="送货单号"
              placeholder="输入送货单号"
            />
          </div>
        </div>
      </div>
      <SectionDivider title="收货明细" />
      <div class="space-y-3">
        <div
          v-if="receiveItems.length === 0"
          class="rounded border border-gray-200 p-4 text-sm text-gray-500 dark:border-dark-700 dark:text-dark-400"
        >
          当前采购订单没有可收货明细
        </div>
        <div
          v-for="item in receiveItems"
          :key="item.id"
          class="rounded border border-gray-200 p-3 dark:border-dark-700"
        >
          <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ item.material_code || '-' }} {{ item.material_name || '-' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-dark-400">
                规格：{{ item.material_specification || '未填写' }}
              </div>
              <div class="text-xs text-gray-500 dark:text-dark-400">
                采购 {{ formatQty(item.quantity) }}，已收 {{ formatQty(item.received_quantity) }}，剩余 {{ formatQty(item.remaining_quantity) }}
              </div>
            </div>
            <StatusTag
              :status="item.status"
              category="purchaseOrder"
              :label="item.status_display"
              size="small"
            />
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr]">
            <InputNumber
              v-model="item.receive_quantity"
              label="本次收货"
              :min="0"
              :max="Number(item.remaining_quantity || 0)"
              :precision="2"
              :disabled="Number(item.remaining_quantity || 0) <= 0"
            />
            <Input
              v-model="item.notes"
              label="备注"
              placeholder="本次收货备注"
              :disabled="Number(item.remaining_quantity || 0) <= 0"
            />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <button
        class="btn btn-secondary"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="isLoading"
        @click="handleSubmit"
      >
        确定收货
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { purchaseOrderAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'
import { StatusTag, Input, InputNumber, DescriptionGrid, DescriptionItem, LoadingOverlay, SectionDivider } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  purchaseOrder: { type: Object, default: null },
  purchaseDetail: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['success', 'update:visible'])

const submitting = ref(false)
const form = reactive({ received_date: '', delivery_note_number: '' })
const receiveItems = ref<any[]>([])
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const isLoading = computed(() => props.loading || submitting.value)

const formatQty = (value: any) => Number(value || 0).toFixed(2)

const syncItems = () => {
  receiveItems.value = ((props.purchaseDetail as any)?.items || []).map((item: any) => {
    const quantity = Number(item.quantity || 0)
    const received = Number(item.received_quantity || 0)
    const remaining = item.remaining_quantity !== undefined && item.remaining_quantity !== null
      ? Number(item.remaining_quantity)
      : Math.max(0, quantity - received)
    return {
      ...item,
      remaining_quantity: remaining,
      receive_quantity: 0,
      notes: ''
    }
  })
}

watch(() => props.visible, (visible) => {
  if (visible) {
    form.received_date = new Date().toISOString().slice(0, 10)
    form.delivery_note_number = ''
    syncItems()
  }
})

watch(() => props.purchaseDetail, () => {
  if (props.visible) syncItems()
})

const handleSubmit = async () => {
  const items = receiveItems.value
    .filter((item: any) => Number(item.receive_quantity || 0) > 0)
    .map((item: any) => ({
      item_id: item.id,
      received_quantity: Number(item.receive_quantity),
      delivery_note_number: form.delivery_note_number.trim(),
      notes: item.notes?.trim?.() || ''
    }))

  if (items.length === 0) {
    ErrorHandler.showWarning('请输入收货数量')
    return
  }

  submitting.value = true
  try {
    await purchaseOrderAPI.receive((props.purchaseOrder as any)?.id, {
      received_date: form.received_date || undefined,
      items
    })
    useUIStore().showSuccess('收货成功，请进行质检')
    emit('success')
    handleClose()
  } catch (error: any) {
    ErrorHandler.showMessage(error, '收货失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  form.received_date = ''
  form.delivery_note_number = ''
  receiveItems.value = []
  emit('update:visible', false)
}
</script>
