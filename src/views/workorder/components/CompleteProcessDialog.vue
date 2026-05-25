<template>
  <BaseDialog
    :show="dialogVisible"
    title="完成工序"
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
        <label class="input-label mb-1.5 block">任务完成情况</label>
        <div v-if="process?.tasks">
          <div class="mb-3 flex flex-wrap items-center gap-4">
            <span>总任务数：{{ process.tasks.length }}</span><span>已完成：{{ completedCount }}</span><span
              v-if="incompleteCount > 0"
              class="font-bold text-warning-600"
            >未完成：{{ incompleteCount }}</span>
          </div>
          <Alert
            v-if="incompleteCount > 0"
            type="warning"
            :closable="false"
            class="mb-3"
          >
            <template #title>
              <p>该工序还有 {{ incompleteCount }} 个任务未完成。建议先完成任务，如需强制完成请勾选下方选项。</p>
            </template>
          </Alert>
        </div>
      </div>
      <div>
        <label class="input-label mb-1.5 block">完成数量</label>
        <InputNumber
          v-model="form.quantity_completed"
          :min="0"
          class="w-full"
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">不良品数量</label>
        <InputNumber
          v-model="form.quantity_defective"
          :min="0"
          class="w-full"
        />
      </div>
      <div v-if="incompleteCount > 0">
        <Checkbox
          v-model="form.force_complete"
          label="强制完成（即使任务未完成）"
        />
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
import { Input, InputNumber, Checkbox } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, process: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref<any>(null)
const form = reactive({ quantity_completed: 0, quantity_defective: 0, force_complete: false })
const rules = { quantity_completed: [{ required: true, message: '请输入完成数量', trigger: 'blur' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const completedCount = computed(() => props.process?.tasks?.filter((t: any) => t.status === 'completed').length || 0)
const incompleteCount = computed(() => props.process?.tasks?.filter((t: any) => t.status !== 'completed').length || 0)

const handleSubmit = () => { formRef.value?.validate((valid: any) => { if (valid) emit('submit', { processId: props.process?.id, data: { ...form } }) }) }
const handleClose = () => { Object.assign(form, { quantity_completed: 0, quantity_defective: 0, force_complete: false }) }
</script>