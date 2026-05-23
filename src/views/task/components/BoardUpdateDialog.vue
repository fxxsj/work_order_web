<template>
  <BaseDialog :show="dialogVisible" title="更新任务" width="normal" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <Input :model-value="task?.work_content" label="任务内容" disabled />
      <Input :model-value="task?.production_quantity" label="生产数量" disabled />
      <div>
        <label class="input-label mb-1.5 block">完成数量</label>
        <InputNumber v-model="form.quantity_completed" :min="0" :max="task?.production_quantity || 999999" class="w-full sm:w-52" />
      </div>
      <TextArea v-model="form.notes" label="更新说明" :rows="3" placeholder="请输入更新说明（可选）" />
    </div>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button class="btn btn-secondary" @click="handleClose">取消</button>
        <button class="btn btn-primary" :disabled="loading" @click="handleConfirm">确定</button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Input, TextArea, InputNumber } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref<any>(null)
const FORM_INITIAL = { quantity_completed: 0, notes: '' }
const form = reactive({ ...FORM_INITIAL })
const rules = { quantity_completed: [{ required: true, message: '请输入完成数量', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

watch(() => props.visible, (val: any) => { if (val && props.task) initForm() })

const initForm = () => { Object.assign(form, { quantity_completed: props.task?.quantity_completed || 0, notes: props.task?.notes || '' }); nextTick(() => { formRef.value?.clearValidate() }) }
const resetForm = () => { Object.assign(form, FORM_INITIAL); formRef.value?.resetFields() }
const handleConfirm = () => { formRef.value?.validate((valid: any) => { if (valid) emit('confirm', { ...form }) }) }
const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>