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
          :model-value="task?.production_quantity || 0"
          disabled
          class="flex-1"
        />
      </div>
      <div class="flex items-start gap-3">
        <label class="w-28 text-sm text-gray-600 dark:text-gray-400 pt-2">子任务列表</label>
        <div class="flex-1">
          <div class="mb-3 flex flex-wrap items-center gap-3">
            <button
              class="btn btn-primary btn-sm"
              @click="addSplitItem"
            >
              添加子任务
            </button><span class="text-sm text-gray-400">至少需要2个子任务</span>
          </div>
          <LineItemsTable
            :columns="splitColumns"
            :items="form.splits"
            :delete-disabled="() => form.splits.length <= 2"
            @delete="removeSplit"
          >
            <template #cell-index="{ index }">
              <span class="text-center block">{{ index + 1 }}</span>
            </template>
            <template #cell-production_quantity="{ row }">
              <InputNumber
                v-model="row.production_quantity"
                :min="1"
                :max="task?.production_quantity || 999999"
                class="w-full"
              />
            </template>
            <template #cell-assigned_department="{ row, index }">
              <Select
                v-model="row.assigned_department"
                :options="departmentOptions"
                placeholder="选择部门"
                filterable
                clearable
                class="w-full"
                @change="v => handleDeptChange(index, v)"
              />
            </template>
            <template #cell-assigned_operator="{ row }">
              <Select
                v-model="row.assigned_operator"
                :options="userOptions"
                placeholder="选择操作员"
                filterable
                clearable
                class="w-full"
              />
            </template>
          </LineItemsTable>
          <div
            v-if="form.splits.length >= 2"
            class="mt-3 text-sm font-bold text-warning-600"
          >
            子任务数量总和: {{ totalQuantity }} / {{ task?.production_quantity || 0 }}
          </div>
        </div>
      </div>
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
        :disabled="loading"
        @click="handleSubmit"
      >
        确定
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Icon, Input, InputNumber, Select, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { useUIStore } from '@/stores/ui'

const props = defineProps({ visible: { type: Boolean, default: false }, task: { type: Object, default: null }, departmentList: { type: Array as any, default: () => [] }, userList: { type: Array as any, default: () => [] }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const form = reactive({ splits: [] as any[] })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const totalQuantity = computed(() => form.splits.reduce((sum: any, s: any) => sum + (s.production_quantity || 0), 0))
const departmentOptions = computed(() => props.departmentList.map((d: any) => ({ value: d.id, label: d.name })))
const userOptions = computed(() => props.userList.map((u: any) => ({ value: u.id, label: u.username || `${(u.first_name || '')}${(u.last_name || '')}`.trim() || u.id })))

const addSplitItem = () => form.splits.push({ production_quantity: Math.floor((props.task?.production_quantity || 0) / 2), assigned_department: null, assigned_operator: null })
const removeSplit = (index: any) => form.splits.splice(index, 1)

const splitColumns: Column[] = [
  { key: 'index', label: '序号', width: 64, align: 'center' },
  { key: 'production_quantity', label: '生产数量', width: 160 },
  { key: 'assigned_department', label: '分派部门', width: 176 },
  { key: 'assigned_operator', label: '分派操作员', width: 176 },
]
const handleDeptChange = (index: any, val: any) => { form.splits[index].assigned_operator = null }
const handleSubmit = () => {
  if (form.splits.length < 2) { useUIStore().showWarning('至少需要2个子任务'); return }
  emit('submit', { taskId: props.task?.id, splits: form.splits })
}
const handleClose = () => { form.splits = [] }
</script>
