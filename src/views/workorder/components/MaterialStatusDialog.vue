<template>
  <BaseDialog :show="dialogVisible" title="更新物料采购状态" width="narrow" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <Input :model-value="material?.material_name" label="物料名称" disabled />
      <div>
        <label class="input-label mb-1.5 block">当前状态</label>
        <StatusTag :label="material?.purchase_status_display" :variant="currentStatusVariant" />
      </div>
      <Select
        v-model="form.purchase_status"
        label="更新为"
        :options="availableStatuses"
        placeholder="请选择状态"
        @change="handleStatusChange"
      />
      <div v-if="form.purchase_status === 'ordered'">
        <label class="input-label mb-1.5 block">采购日期</label>
        <input type="date" v-model="form.purchase_date" class="input w-full" />
      </div>
      <div v-if="form.purchase_status === 'received'">
        <label class="input-label mb-1.5 block">回料日期</label>
        <input type="date" v-model="form.received_date" class="input w-full" />
      </div>
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Input, Select, StatusTag } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  material: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref<any>(null)
const form = reactive({ purchase_status: '', purchase_date: '', received_date: '' })
const rules = { purchase_status: [{ required: true, message: '请选择状态', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const statusVariantMap: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
  pending: 'info', ordered: 'info', received: 'success', cut: 'warning', completed: 'success'
}
const currentStatusVariant = computed(() => statusVariantMap[props.material?.purchase_status] || 'info')
const availableStatuses = computed(() => {
  const s = props.material?.purchase_status
  const map = { pending: [{ value: 'ordered', label: '已下单' }], ordered: [{ value: 'received', label: '已回料' }], received: [{ value: 'cut', label: '已开料' }], cut: [{ value: 'completed', label: '已完成' }] }
  return (map as any)[s] || []
})

const handleStatusChange = () => {}
const handleSubmit = () => { formRef.value?.validate((valid: any) => { if (valid) emit('submit', { id: props.material?.id, data: { ...form } }) }) }
const handleClose = () => { Object.assign(form, { purchase_status: '', purchase_date: '', received_date: '' }) }
</script>
