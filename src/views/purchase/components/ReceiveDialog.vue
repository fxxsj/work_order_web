<template>
  <BaseDialog :show="dialogVisible" title="采购收货" width="extra-wide" @close="handleClose; dialogVisible = false;">
    <div v-loading="loading">
      <div class="descriptions-grid mb-4" style="--col: 3; font-size: 14px;">
        <div class="description-item"><div class="description-label">采购单号</div><div class="description-value">{{ purchaseOrder?.order_number }}</div></div>
        <div class="description-item"><div class="description-label">供应商</div><div class="description-value">{{ purchaseOrder?.supplier_name }}</div></div>
        <div class="description-item"><div class="description-label">状态</div><div class="description-value"><StatusTag :status="purchaseOrder?.status" category="purchaseOrder" :label="purchaseOrder?.status_display" /></div></div>
      </div>
      <div class="mb-4">
        <div class="flex flex-wrap gap-5">
          <div class="flex-1 min-w-[200px]"><div class="form-item"><label class="form-label">收货日期</label><input type="date" v-model="form.received_date" class="input w-full" /></div></div>
          <div class="flex-1 min-w-[200px]"><Input v-model="form.delivery_note_number" label="送货单号" placeholder="输入送货单号" /></div>
        </div>
      </div>
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">确定收货</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { StatusTag, Input } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, purchaseOrder: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const form = reactive({ received_date: '', delivery_note_number: '' })
const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const handleSubmit = () => emit('submit', form)
const handleClose = () => { form.received_date = ''; form.delivery_note_number = ''; emit('update:visible', false) }
</script>

