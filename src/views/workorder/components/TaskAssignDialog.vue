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
        v-model="form.assigned_department"
        label="分派部门"
        :options="departmentList.map((d: any) => ({ value: d.id, label: d.name }))"
        placeholder="请选择部门"
        searchable
        @change="handleDeptChange"
      />
      <Select
        v-model="form.assigned_operator"
        label="分派操作员"
        :options="userList.map((u: any) => ({ value: u.id, label: u.username || u.id }))"
        placeholder="请选择操作员"
        searchable
      />
      <TextArea
        v-model="form.reason"
        label="调整原因"
        :rows="2"
        placeholder="请输入调整原因（可选）"
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
        @click="handleSubmit"
      >
        确定
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Input, Select, TextArea } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, task: { type: Object, default: null }, departmentList: { type: Array as any, default: () => [] }, userList: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ assigned_department: null, assigned_operator: null, reason: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

const handleDeptChange = (val: any) => { form.assigned_operator = null }
const handleSubmit = () => emit('submit', { taskId: props.task?.id, data: { ...form } })
const handleClose = () => { Object.assign(form, { assigned_department: null, assigned_operator: null, reason: '' }) }
</script>
