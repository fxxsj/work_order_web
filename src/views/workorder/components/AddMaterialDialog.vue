<template>
  <BaseDialog
    :show="dialogVisible"
    title="添加物料"
    width="narrow"
    @close="handleClose; dialogVisible = false;"
  >
    <div class="space-y-4">
      <Select
        v-model="form.material_id"
        label="物料"
        :options="materialList.map((m: any) => ({ value: m.id, label: m.name }))"
        placeholder="请选择物料"
        searchable
      />
      <TextArea
        v-model="form.notes"
        label="备注"
        :rows="3"
        placeholder="请输入备注（可选）"
      />
    </div>
    <template #footer>
      <button
        class="btn"
        @click="handleCancel"
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
import { ref, reactive, computed } from 'vue'
import { Select, TextArea } from '@/components/common'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  materialList: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:modelValue'])

const formRef = ref(null)
const form = reactive({ material_id: null, notes: '' })

const dialogVisible = computed({ get: () => props.modelValue, set: (val: any) => emit('update:modelValue', val) })

const handleSubmit = () => { if (form.material_id) emit('submit', { material_id: form.material_id, notes: form.notes }) }
const handleCancel = () => { emit('update:modelValue', false) }
const handleClose = () => { form.material_id = null; form.notes = '' }
</script>
