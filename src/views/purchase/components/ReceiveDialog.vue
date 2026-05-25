<template>
  <BaseDialog
    :show="dialogVisible"
    title="采购订单收货"
    width="extra-wide"
    @close="handleClose"
  >
    <div class="relative">
      <LoadingOverlay :show="loading" />
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
        :disabled="loading"
        @click="handleSubmit"
      >
        确定收货
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { StatusTag, Input, DescriptionGrid, DescriptionItem, LoadingOverlay } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, purchaseOrder: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const form = reactive({ received_date: '', delivery_note_number: '' })
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const handleSubmit = () => emit('submit', form)
const handleClose = () => { form.received_date = ''; form.delivery_note_number = ''; emit('update:visible', false) }
</script>
