<template>
  <BaseDialog
    :show="dialogVisible"
    title="新建客户"
    width="narrow"
    @close="handleClose"
  >
    <div class="space-y-4">
      <Input
        v-model="form.name"
        label="客户名称"
        placeholder="请输入客户名称"
        required
      />
      <Input
        v-model="form.contact_person"
        label="联系人"
        placeholder="请输入联系人"
      />
      <Input
        v-model="form.phone"
        label="联系电话"
        placeholder="请输入联系电话"
      />
      <TextArea
        v-model="form.address"
        label="地址"
        :rows="2"
        placeholder="请输入地址"
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
        :disabled="loading || !form.name"
        @click="handleSubmit"
      >
        <span
          v-if="loading"
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent align-middle mr-1"
        />
        创建
      </button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Input, TextArea } from '@/components/common'
import { customerAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const loading = ref(false)
const form = reactive({
  name: '',
  contact_person: '',
  phone: '',
  address: ''
})

const dialogVisible = computed({
  get: () => props.modelValue ?? props.visible,
  set: (val) => {
    emit('update:modelValue', val)
    emit('update:visible', val)
  }
})

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  form.name = ''
  form.contact_person = ''
  form.phone = ''
  form.address = ''
}

const handleSubmit = async () => {
  if (!form.name) {
    useUIStore().showWarning('请输入客户名称')
    return
  }

  loading.value = true
  try {
    const created: any = await customerAPI.create({
      name: form.name,
      contact_person: form.contact_person || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined
    })
    useUIStore().showSuccess('客户创建成功')
    emit('created', created)
    handleClose()
  } catch (error: any) {
    useUIStore().showError(error?.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>
