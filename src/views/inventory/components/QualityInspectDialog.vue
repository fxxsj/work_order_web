<template>
  <BaseDialog :show="visible" title="质检检验" width="normal" @close="visible = false">
    <div class="space-y-4">
      <div>
        <label class="input-label mb-1.5 block">合格数量</label>
        <InputNumber v-model="form.passed_quantity" :min="0" class="w-full" />
      </div>
      <div>
        <label class="input-label mb-1.5 block">不合格数量</label>
        <InputNumber v-model="form.failed_quantity" :min="0" class="w-full" />
      </div>
      <TextArea v-model="form.notes" label="备注" :rows="3" />
    </div>
    <template #footer><button class="btn" @click="visible = false">取消</button><button class="btn btn-primary" @click="handleSubmit">提交</button></template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { TextArea, InputNumber } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['submit', 'update:visible'])
const visible = computed({ get: () => props.visible, set: (v: any) => emit('update:visible', v) })
const form = reactive({ passed_quantity: 0, failed_quantity: 0, notes: '' })
const handleSubmit = () => emit('submit', { ...form })
</script>
