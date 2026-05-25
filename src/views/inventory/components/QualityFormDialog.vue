<template>
  <BaseDialog
    :show="visible"
    title="质检表单"
    width="normal"
    @close="visible = false"
  >
    <div class="space-y-4">
      <Input
        :model-value="data?.product_name"
        label="产品"
        disabled
      />
      <Select
        v-model="form.status"
        :options="statusOptions"
        label="检验结果"
        class="w-full"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        @click="visible = false"
      >
        取消
      </button><button
        class="btn btn-primary"
        @click="handleSubmit"
      >
        提交
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { BaseDialog, Input, Select } from '@/components/common'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['submit', 'update:visible'])
const visible = computed({ get: () => props.visible, set: (v: any) => emit('update:visible', v) })
const form = reactive({ status: 'pending' })
const statusOptions = [
  { value: 'pending', label: '待检验' },
  { value: 'passed', label: '合格' },
  { value: 'failed', label: '不合格' }
]
const handleSubmit = () => emit('submit', { ...form })
</script>
