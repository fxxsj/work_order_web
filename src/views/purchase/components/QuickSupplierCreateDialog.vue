<template>
  <BaseDialog
    :show="dialogVisible"
    title="新建供应商"
    width="narrow"
    @close="handleClose"
  >
    <div class="space-y-4">
      <Input
        v-model="form.name"
        label="供应商名称"
        placeholder="请输入供应商名称"
        required
      />
      <Input
        v-model="form.code"
        label="供应商编码"
        placeholder="请输入供应商编码"
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
      <Input
        v-model="form.email"
        label="邮箱"
        placeholder="请输入邮箱"
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
        :disabled="loading || !form.name || !form.code"
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
import { supplierAPI } from '@/api/modules'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:visible', 'created'])

const loading = ref(false)
const form = reactive({
  name: '',
  code: '',
  contact_person: '',
  phone: '',
  email: '',
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
  form.code = ''
  form.contact_person = ''
  form.phone = ''
  form.email = ''
  form.address = ''
}

const handleSubmit = async () => {
  if (!form.name) {
    useUIStore().showWarning('请输入供应商名称')
    return
  }
  if (!form.code) {
    useUIStore().showWarning('请输入供应商编码')
    return
  }

  loading.value = true
  try {
    const created: any = await supplierAPI.create({
      name: form.name,
      code: form.code,
      contact_person: form.contact_person || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      address: form.address || undefined
    })
    useUIStore().showSuccess('供应商创建成功')
    emit('created', created)
    handleClose()
  } catch (error: any) {
    useUIStore().showError(error?.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>
