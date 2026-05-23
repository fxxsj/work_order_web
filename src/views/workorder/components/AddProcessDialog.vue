<template>
  <BaseDialog :show="dialogVisible" title="添加工序" width="narrow" @close="handleClose; dialogVisible = false;">
    <div class="space-y-4">
      <Select
        v-model="form.process_id"
        label="工序"
        :options="processList.map((p: any) => ({ value: p.id, label: p.name }))"
        placeholder="请选择工序"
      />
      <div>
        <label class="input-label mb-1.5 block">顺序</label>
        <InputNumber v-model="form.sequence" :min="1" :max="100" class="w-full" />
      </div>
    </div>
    <template #footer>
      <button class="btn" @click="handleCancel">取消</button>
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">确定</button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Select, InputNumber } from '@/components/common'

const props = defineProps({
  visible: { type: Boolean, default: false },
  processList: { type: Array as any, default: () => [] },
  nextSequence: { type: Number, default: 1 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ process_id: null, sequence: 1 })

const dialogVisible = computed({ get: () => props.visible, set: (val: any) => emit('update:visible', val) })

watch(() => props.visible, (val: any) => { if (val) form.sequence = props.nextSequence })

const handleSubmit = () => { if (form.process_id) emit('submit', { process_id: form.process_id, sequence: form.sequence }) }
const handleCancel = () => { emit('update:visible', false) }
const handleClose = () => { form.process_id = null }
</script>
