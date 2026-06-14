<template>
  <BaseDialog
    :show="dialogVisible"
    :title="`批量分派 ${taskCount} 个任务`"
    width="narrow"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Select
        v-model="form.assigned_department"
        label="分派部门"
        :options="departmentList.map((d: any) => ({ value: d.id, label: d.name }))"
        placeholder="请选择部门"
        searchable
        @change="handleDepartmentChange"
      />
      <Select
        v-model="form.assigned_operator"
        label="分派操作员"
        :options="operatorList.map(op => ({ value: op.id, label: op.username || `${op.first_name}${op.last_name}` }))"
        placeholder="请选择操作员"
        searchable
        :disabled="!form.assigned_department"
      />
      <div class="text-xs text-gray-400 -mt-2">
        留空则只分派部门，不分派具体操作员
      </div>
      <TextArea
        v-model="form.reason"
        label="调整原因"
        :rows="3"
        placeholder="请输入调整原因（可选）"
      />
      <TextArea
        v-model="form.notes"
        label="备注"
        :rows="2"
        placeholder="请输入备注（可选）"
      />
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
        :disabled="submitting"
        @click="handleSubmit"
      >
        确定分派
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { authAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { Select, TextArea } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  taskCount: { type: Number, default: 0 },
  departmentList: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref<any>(null)
const operatorList = ref<any[]>([])
const loadingOperators = ref(false)
const submitting = ref(false)

const form = reactive({ assigned_department: null, assigned_operator: null, reason: '', notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

watch(() => props.visible, (val: any) => { if (val) resetForm() })

const resetForm = () => { Object.assign(form, { assigned_department: null, assigned_operator: null, reason: '', notes: '' }); operatorList.value = []; nextTick(() => { formRef.value?.clearValidate() }) }

const handleDepartmentChange = async (departmentId: any) => {
  form.assigned_operator = null
  if (!departmentId) { operatorList.value = []; return }
  loadingOperators.value = true
  try { operatorList.value = ((await authAPI.getUsersByDepartment(departmentId)) as any)?.results || [] } catch (error: any) { ErrorHandler.showMessage(error, '加载操作员列表') } finally { loadingOperators.value = false }
}

const handleClose = () => { resetForm(); emit('update:visible', false) }

const handleSubmit = () => {
  formRef.value?.validate((valid: any) => { if (valid) emit('confirm', { ...form }) })
}
</script>
