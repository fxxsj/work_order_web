<template>
  <BaseDialog
    :show="dialogVisible"
    title="分派任务"
    width="narrow"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Input
        :model-value="task?.work_content"
        label="任务内容"
        disabled
      />
      <Select
        v-model="form.assigned_operator"
        label="操作员"
        :options="users.map((u: any) => ({ value: u.id, label: u.username }))"
        placeholder="请选择操作员"
        searchable
      />
      <TextArea
        v-model="form.notes"
        label="分派说明"
        :rows="3"
        placeholder="请输入分派说明（可选）"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        @click="handleClose"
      >
        取消
      </button>
      <button
        class="btn btn-primary"
        :disabled="loading"
        @click="handleConfirm"
      >
        确定
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Input, Select, TextArea } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  users: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref<any>(null)
const FORM_INITIAL = { assigned_operator: null, notes: '' }
const form = reactive({ ...FORM_INITIAL })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

watch(() => props.visible, (val: any) => { if (val && props.task) initForm() })

const initForm = () => { Object.assign(form, { assigned_operator: props.task?.assigned_operator || null, notes: '' }); nextTick(() => { formRef.value?.clearValidate() }) }
const resetForm = () => { Object.assign(form, FORM_INITIAL); formRef.value?.resetFields() }
const handleConfirm = () => { formRef.value?.validate((valid: any) => { if (valid) emit('confirm', { ...form }) }) }
const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
