<template>
  <BaseDialog :show="dialogVisible" title="更新任务" width="normal" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <Input :model-value="task?.work_content" label="任务内容" disabled />
      <div>
        <label class="input-label mb-1.5 block">生产数量</label>
        <InputNumber :model-value="task?.production_quantity || 0" disabled class="w-full" />
      </div>
      <div>
        <label class="input-label mb-1.5 block">当前完成数量</label>
        <InputNumber :model-value="task?.quantity_completed || 0" disabled class="w-full" />
      </div>
      <div>
        <label class="input-label mb-1.5 block">本次完成数量</label>
        <InputNumber v-model="form.quantity_completed" :min="0" :max="maxCompleted" class="w-full" />
        <div v-if="task?.production_quantity" class="text-xs text-gray-400 mt-1">
          计划：{{ task.production_quantity }}，当前：{{ task.quantity_completed || 0 }}，更新后：{{ (task.quantity_completed || 0) + (form.quantity_completed || 0) }}
          <span v-if="(task.quantity_completed || 0) + (form.quantity_completed || 0) >= task.production_quantity" class="text-success-600">（将自动标记为已完成）</span>
          <span v-else class="text-warning-600">（状态保持为进行中）</span>
        </div>
      </div>
      <div>
        <label class="input-label mb-1.5 block">本次不良品数量</label>
        <InputNumber v-model="form.quantity_defective" :min="0" class="w-full" />
      </div>
      <TextArea v-model="form.notes" label="备注" :rows="2" placeholder="请输入备注（可选）" />
    </div>
    <template #footer>
      <button class="btn" @click="handleClose">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Input, TextArea, InputNumber } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, task: { type: Object, default: null }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ quantity_completed: 0, quantity_defective: 0, notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const maxCompleted = computed(() => (props.task?.production_quantity || 0) - (props.task?.quantity_completed || 0))

const handleSubmit = () => emit('submit', { taskId: props.task?.id, data: { ...form } })
const handleClose = () => { Object.assign(form, { quantity_completed: 0, quantity_defective: 0, notes: '' }) }
</script>
