<template>
  <BaseDialog :show="dialogVisible" title="拆分任务" width="wide" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <Input :model-value="task?.work_content" label="父任务" disabled />
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">生产数量</label>
        <InputNumber :model-value="task?.production_quantity" disabled class="flex-1" />
      </div>
      <div>
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <button class="btn btn-primary btn-sm" @click="addSplitItem"><Icon name="plus" class="h-3 w-3" /> 添加子任务</button>
          <span class="text-sm text-gray-400">至少需要2个子任务，子任务数量总和不能超过父任务数量</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
                <th class="px-3 py-2 w-14 text-center">序号</th>
                <th class="px-3 py-2 w-36">生产数量</th>
                <th class="px-3 py-2 w-44">分派部门</th>
                <th class="px-3 py-2 w-44">分派操作员</th>
                <th class="px-3 py-2 min-w-48">工作内容</th>
                <th class="px-3 py-2 w-20 text-center">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
              <tr v-for="(item, index) in formData.splits" :key="index">
                <td class="px-3 py-2 text-center">{{ index + 1 }}</td>
                <td class="px-3 py-2"><InputNumber v-model="(item as any).production_quantity" :min="1" class="w-full" /></td>
                <td class="px-3 py-2">
                  <Select v-model="(item as any).assigned_department" :options="departmentOptions" placeholder="请选择部门" filterable clearable class="w-full" />
                </td>
                <td class="px-3 py-2">
                  <Select v-model="(item as any).assigned_operator" :options="userOptions" placeholder="请选择操作员" filterable clearable class="w-full" />
                </td>
                <td class="px-3 py-2">
                  <input v-model="(item as any).work_content" class="input w-full" placeholder="可选，默认使用父任务内容" />
                </td>
                <td class="px-3 py-2 text-center">
                  <button class="btn btn-danger btn-sm" @click="removeSplitItem(index)" :disabled="formData.splits.length <= 2"><Icon name="trash" class="h-3 w-3" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-3 text-sm text-gray-400">子任务数量总和：{{ getTotalSplitQuantity() }} / {{ task?.production_quantity || 0 }} <span v-if="getTotalSplitQuantity() > (task?.production_quantity || 0)" class="font-bold text-danger-600">（超出父任务数量）</span></div>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="submitting" @click="handleConfirm">确定拆分</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { Icon, Input, InputNumber, Select } from '@/components/common'
import { ElMessage } from '@/utils/message'

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

const handleConfirm = () => {
  if (!formData.splits || formData.splits.length < 2) { ElMessage.error('至少需要2个子任务'); return }
  const total = getTotalSplitQuantity()
  if (total > (props.task?.production_quantity || 0)) { ElMessage.error('子任务数量总和不能超过父任务数量'); return }
  emit('confirm', { splits: formData.splits.map((split: any) => ({ production_quantity: split.production_quantity, assigned_department: split.assigned_department || null, assigned_operator: split.assigned_operator || null, work_content: split.work_content || '' })) })
}

const handleClose = () => { emit('update:visible', false); resetForm() }
const resetForm = () => { formData.splits = [] }
</script>