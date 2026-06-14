<template>
  <BaseDialog
    :show="dialogVisible"
    title="拆分任务"
    width="wide"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Input
        :model-value="task?.work_content"
        label="父任务"
        disabled
      />
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">生产数量</label>
        <InputNumber
          :model-value="task?.production_quantity"
          disabled
          class="flex-1"
        />
      </div>
      <div>
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <BaseButton
            variant="primary"
            size="sm"
            icon="plus"
            @click="addSplitItem"
          >
            添加子任务
          </BaseButton>
          <span class="text-sm text-gray-400">至少需要2个子任务，子任务数量总和不能超过父任务数量</span>
        </div>
        <LineItemsTable
          :columns="splitColumns"
          :items="formData.splits"
          :delete-disabled="() => formData.splits.length <= 2"
          @delete="removeSplitItem"
        >
          <template #cell-index="{ index }">
            <span class="text-center block">{{ index + 1 }}</span>
          </template>
          <template #cell-production_quantity="{ row }">
            <InputNumber
              v-model="row.production_quantity"
              :min="1"
              class="w-full"
            />
          </template>
          <template #cell-assigned_department="{ row }">
            <Select
              v-model="row.assigned_department"
              :options="departmentOptions"
              placeholder="请选择部门"
              filterable
              clearable
              class="w-full"
            />
          </template>
          <template #cell-assigned_operator="{ row }">
            <Select
              v-model="row.assigned_operator"
              :options="userOptions"
              placeholder="请选择操作员"
              filterable
              clearable
              class="w-full"
            />
          </template>
          <template #cell-work_content="{ row }">
            <input
              v-model="row.work_content"
              class="input w-full"
              placeholder="可选，默认使用父任务内容"
            >
          </template>
        </LineItemsTable>
        <div class="mt-3 text-sm text-gray-400">
          子任务数量总和：{{ getTotalSplitQuantity() }} / {{ task?.production_quantity || 0 }} <span
            v-if="getTotalSplitQuantity() > (task?.production_quantity || 0)"
            class="font-bold text-danger-600"
          >（超出父任务数量）</span>
        </div>
      </div>
    </div>
    <template #footer>
      <BaseButton
        variant="secondary"
        @click="handleClose"
      >
        取消
      </BaseButton>
      <BaseButton
        variant="primary"
        :loading="submitting"
        @click="handleConfirm"
      >
        确定拆分
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { BaseButton, Input, InputNumber, Select, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  visible: { type: Boolean, default: false },
  task: { type: Object, default: null },
  departmentList: { type: Array as any, default: () => [] },
  userList: { type: Array as any, default: () => [] },
  loadingDepartments: { type: Boolean, default: false },
  loadingUsers: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const submitting = ref(false)
const formData = reactive({ splits: [] as any[] })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

const departmentOptions = computed(() => props.departmentList.map((d: any) => ({ value: d.id, label: d.name })))
const userOptions = computed(() => props.userList.map((u: any) => ({ value: u.id, label: u.username || `${(u.first_name || '')}${(u.last_name || '')}`.trim() || u.id })))

watch(() => props.task, (newTask: any) => { if (newTask) initFormData(newTask) })
watch(() => props.visible, (val: any) => { if (val && props.task) initFormData(props.task) })

const initFormData = (task: any) => {
  const defaultQuantity = Math.floor(task.production_quantity / 2)
  formData.splits = [
    { production_quantity: defaultQuantity, assigned_department: null, assigned_operator: null, work_content: '' },
    { production_quantity: task.production_quantity - defaultQuantity, assigned_department: null, assigned_operator: null, work_content: '' }
  ]
}

const addSplitItem = () => { formData.splits.push({ production_quantity: 0, assigned_department: null, assigned_operator: null, work_content: '' }) }
const removeSplitItem = (index: any) => { if (formData.splits.length > 2) formData.splits.splice(index, 1) }
const getTotalSplitQuantity = () => formData.splits.reduce((sum: any, item: any) => sum + (item.production_quantity || 0), 0)

const splitColumns: Column[] = [
  { key: 'index', label: '序号', width: 56, align: 'center' },
  { key: 'production_quantity', label: '生产数量', width: 144 },
  { key: 'assigned_department', label: '分派部门', width: 176 },
  { key: 'assigned_operator', label: '分派操作员', width: 176 },
  { key: 'work_content', label: '工作内容', minWidth: 192 },
]

const handleConfirm = () => {
  if (!formData.splits || formData.splits.length < 2) { useUIStore().showError('至少需要2个子任务'); return }
  const total = getTotalSplitQuantity()
  if (total > (props.task?.production_quantity || 0)) { useUIStore().showError('子任务数量总和不能超过父任务数量'); return }
  emit('confirm', { splits: formData.splits.map((split: any) => ({ production_quantity: split.production_quantity, assigned_department: split.assigned_department || null, assigned_operator: split.assigned_operator || null, work_content: split.work_content || '' })) })
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { formData.splits = [] }
</script>