<template>
  <BaseDialog
    :show="dialogVisible"
    :title="dialogTitle"
    width="narrow"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">任务内容</label>
        <div class="flex-1 rounded-lg bg-gray-100 p-3 text-sm text-gray-600 dark:bg-dark-700 dark:text-gray-300">
          {{ task?.work_content }}
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">当前进度</label>
        <div class="flex-1">
          <ProgressBar
            :percentage="currentProgress"
            :status="progressStatus"
          />
          <div class="mt-2 text-xs text-gray-400">
            {{ task?.quantity_completed || 0 }} / {{ task?.production_quantity || 0 }}
          </div>
        </div>
      </div>
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">更新方式</label>
        <RadioGroup
          v-model="updateMode"
          :options="updateModeOptions"
        />
      </div>
      <template v-if="updateMode === 'increment'">
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">本次完成数量</label>
          <div class="flex-1">
            <InputNumber
              v-model="form.quantity_increment"
              :min="0"
              :max="maxIncrement"
              :step="1"
              class="w-full"
            />
            <div class="mt-2 text-xs text-gray-400">
              更新后进度: {{ projectedCompleted }} / {{ task?.production_quantity }}
            </div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">不良品数量</label>
          <InputNumber
            v-model="form.quantity_defective"
            :min="0"
            :step="1"
            class="w-full"
          />
        </div>
      </template>
      <template v-else>
        <TextArea
          v-model="form.completion_reason"
          label="完成理由"
          :rows="2"
          placeholder="请输入完成理由（可选）"
        />
        <div class="flex items-start gap-3">
          <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">不良品数量</label>
          <InputNumber
            v-model="form.quantity_defective"
            :min="0"
            :max="task?.production_quantity"
            :step="1"
            class="w-full"
          />
        </div>
      </template>
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
        {{ updateMode === 'complete' ? '确认完成' : '确认更新' }}
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { BaseDialog, TextArea, InputNumber, RadioGroup, ProgressBar } from '@/components/common'
import { workOrderTaskAPI } from '@/api/modules'
import ErrorHandler from '@/utils/errorHandler'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  visible: Boolean,
  task: { type: Object, default: () => ({}) },
  initialMode: { type: String, default: 'increment' }
})
const emit = defineEmits(['success', 'update:visible'])

const updateMode = ref('increment')
const submitting = ref(false)
const form = reactive({ quantity_increment: 1, quantity_defective: 0, completion_reason: '', notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const dialogTitle = computed(() => updateMode.value === 'complete' ? '完成任务' : '更新进度')
const currentProgress = computed(() => props.task?.production_quantity ? Math.round((props.task.quantity_completed / props.task.production_quantity) * 100) : 0)
const progressStatus = computed(() => { const p = currentProgress.value; return p >= 100 ? 'success' : p >= 50 ? 'active' : 'warning' })
const maxIncrement = computed(() => (props.task?.production_quantity || 0) - (props.task?.quantity_completed || 0))
const projectedCompleted = computed(() => (props.task?.quantity_completed || 0) + (form.quantity_increment || 0))
const updateModeOptions = [
  { value: 'increment', label: '增量更新' },
  { value: 'complete', label: '直接完成' }
]

watch(() => props.visible, (val: any) => { if (val) resetForm() })

const resetForm = () => {
  updateMode.value = props.initialMode === 'complete' ? 'complete' : 'increment'
  Object.assign(form, { quantity_increment: 1, quantity_defective: 0, completion_reason: '', notes: '' })
}

const handleSubmit = async () => {
  if (updateMode.value === 'increment') {
    if (!form.quantity_increment || form.quantity_increment < 1) { useUIStore().showWarning('请输入有效的完成数量'); return }
  }
  submitting.value = true
  try {
    const data = { ...form, version: props.task.version }
    if (updateMode.value === 'complete') { await workOrderTaskAPI.complete(props.task.id, data); ErrorHandler.showSuccess('任务已完成') } else { await workOrderTaskAPI.updateQuantity(props.task.id, data); ErrorHandler.showSuccess('进度已更新') }
    emit('success'); handleClose()
  } catch (error: any) {
    if (error.response?.status === 409) ErrorHandler.showError('任务已被其他操作员更新，请刷新后重试')
    else ErrorHandler.showMessage(error, updateMode.value === 'complete' ? '完成任务' : '更新进度')
  } finally { submitting.value = false }
}

const handleClose = () => emit('update:visible', false)
</script>
