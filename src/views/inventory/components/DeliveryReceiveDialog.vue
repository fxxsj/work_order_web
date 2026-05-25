<template>
  <BaseDialog
    :show="dialogVisible"
    title="签收确认"
    width="normal"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <label class="w-24 text-sm text-gray-600 dark:text-gray-400 pt-2">签收状态</label>
        <RadioGroup
          v-model="form.received"
          :options="receivedOptions"
        />
      </div>
      <TextArea
        v-if="form.received === 'rejected'"
        v-model="form.received_notes"
        label="拒收原因"
        :rows="3"
        placeholder="请输入拒收原因"
        class="w-full"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        @click="handleClose"
      >
        取消
      </button><button
        class="btn btn-primary"
        @click="handleSubmit"
      >
        确认
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { TextArea, RadioGroup } from '@/components/common'

const props = defineProps({ visible: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const form = reactive({ received: 'received', received_notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })
const receivedOptions = [
  { value: 'received', label: '正常签收' },
  { value: 'rejected', label: '拒收' }
]
const handleSubmit = () => emit('submit', { ...form })
const handleClose = () => { form.received = 'received'; form.received_notes = '' }
</script>
