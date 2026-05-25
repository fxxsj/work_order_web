<template>
  <BaseDialog
    :show="dialogVisible"
    title="调整任务分派"
    width="normal"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Input
        :model-value="task?.work_content"
        label="任务内容"
        disabled
      />
      <Select
        v-model="formData.assigned_department"
        label="分派部门"
        :options="departmentList.map((d: any) => ({ value: d.id, label: d.name }))"
        placeholder="请选择部门"
        searchable
        @change="handleDepartmentChange"
      />
      <Select
        v-model="formData.assigned_operator"
        label="分派操作员"
        :options="userList.map((u: any) => ({ value: u.id, label: u.username || `${(u.first_name || '')}${(u.last_name || '')}`.trim() || u.id }))"
        placeholder="请选择操作员"
        searchable
      />
      <TextArea
        v-model="formData.reason"
        label="调整原因"
        :rows="2"
        placeholder="请输入调整原因（可选）"
      />
      <TextArea
        v-model="formData.notes"
        label="备注"
        :rows="2"
        placeholder="请输入备注（可选）"
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
        :disabled="submitting"
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
  departmentList: { type: Array as any, default: () => [] },
  userList: { type: Array as any, default: () => [] },
  loadingDepartments: { type: Boolean, default: false },
  loadingUsers: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'close', 'update:visible', 'department-change'])

const formRef = ref<any>(null)
const submitting = ref(false)

const formData = reactive({ assigned_department: null, assigned_operator: null, reason: '', notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

watch(() => props.task, (newTask: any) => { if (newTask) initFormData(newTask) })
watch(() => props.visible, (val: any) => { if (val && props.task) initFormData(props.task) })

const initFormData = (task: any) => { Object.assign(formData, { assigned_department: task.assigned_department || null, assigned_operator: task.assigned_operator || null, reason: '', notes: '' }) }

const handleDepartmentChange = (departmentId: any) => {
  emit('department-change', departmentId)
  if (departmentId && formData.assigned_operator) {
    const currentOperator = props.userList.find((u: any) => u.id === formData.assigned_operator)
    if (!currentOperator) formData.assigned_operator = null
  }
}

const handleConfirm = () => emit('confirm', { ...formData })
const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { Object.assign(formData, { assigned_department: null, assigned_operator: null, reason: '', notes: '' }); nextTick(() => { formRef.value?.clearValidate() }) }
</script>
