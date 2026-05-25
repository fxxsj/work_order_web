<template>
  <BaseDialog
    :show="dialogVisible"
    title="批量调整工序分派"
    width="normal"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Input
        :model-value="process?.process_name"
        label="工序名称"
        disabled
      />
      <div>
        <label class="input-label mb-1.5 block">任务数量</label>
        <Input
          :model-value="process?.tasks?.length || 0"
          disabled
        />
        <div class="text-xs text-gray-400 mt-1">
          将调整该工序下所有任务的分派
        </div>
      </div>
      <Select
        v-model="form.assigned_department"
        label="新分派部门"
        :options="departmentList.map((d: any) => ({ value: d.id, label: d.name }))"
        placeholder="请选择部门"
        searchable
        @change="handleDepartmentChange"
      />
      <Select
        v-model="form.assigned_operator"
        label="新分派操作员"
        :options="userList.map((u: any) => ({ value: u.id, label: u.username || `${(u.first_name || '')}${(u.last_name || '')}`.trim() || u.id }))"
        placeholder="请选择操作员（可选）"
        searchable
      />
      <TextArea
        v-model="form.reason"
        label="调整原因"
        :rows="3"
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
import { useUIStore } from '@/stores/ui'
import { Input, Select, TextArea } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  process: { type: Object, default: null },
  departmentList: { type: Array as any, default: () => [] },
  userList: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible', 'department-change'])

const formRef = ref(null)
const form = reactive({ assigned_department: null, assigned_operator: null, reason: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

const handleDepartmentChange = (val: any) => { form.assigned_operator = null; emit('department-change', val) }
const handleSubmit = () => { if (!form.assigned_department) { useUIStore().showWarning('请选择部门'); return } emit('submit', { processId: props.process?.id, data: { ...form } }) }
const handleClose = () => { Object.assign(form, { assigned_department: null, assigned_operator: null, reason: '' }) }
</script>
