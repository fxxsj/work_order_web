<template>
  <BaseDialog
    :show="isOpen"
    :title="dialogTitle"
    width="normal"
    @close="handleClose"
  >
    <form
      id="supplier-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <div>
        <Input
          v-model="formData.code"
          label="供应商编码"
          placeholder="请输入编码（留空自动生成）"
          :disabled="isEditMode"
        />
        <div
          v-if="!isEditMode"
          class="text-xs text-gray-400 mt-1"
        >
          编码只能包含中文、字母、数字和连字符
        </div>
      </div>
      <Input
        v-model="formData.name"
        label="供应商名称"
        required
        placeholder="请输入供应商名称"
      />
      <Input
        v-model="formData.contact_person"
        label="联系人"
        placeholder="请输入联系人"
      />
      <Input
        v-model="formData.phone"
        label="联系电话"
        placeholder="请输入联系电话"
      />
      <Input
        v-model="formData.email"
        label="邮箱"
        placeholder="请输入邮箱"
        type="email"
      />
      <TextArea
        v-model="formData.address"
        label="地址"
        :rows="2"
        placeholder="请输入地址"
      />
      <RadioGroup
        v-model="formData.status"
        :options="statusOptions"
      />
      <TextArea
        v-model="formData.notes"
        label="备注"
        :rows="3"
        placeholder="请输入备注"
      />
    </form>
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleClose"
        >
          取消
        </button>
        <button
          form="supplier-form"
          type="submit"
          :disabled="loading"
          class="btn btn-primary"
        >
          {{ loading ? '保存中...' : isEditMode ? '更新' : '创建' }}
        </button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { BaseDialog, Input, RadioGroup, TextArea } from '@/components/common'
import ErrorHandler from '@/utils/errorHandler'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  supplier: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '停用' }
]

const formInitialValues: Record<string, any> = {
  id: undefined as number | undefined,
  code: '',
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  status: 'active',
  notes: ''
}
const formData = reactive({ ...formInitialValues })
const isOpen = ref(false)

const isEditMode = computed(() => props.dialogType === 'edit')
const dialogTitle = computed(() => isEditMode.value ? '编辑供应商' : '新增供应商')

watch(() => props.visible, (val) => {
  isOpen.value = val
  if (val) {
    if (isEditMode.value && props.supplier) initFormFromSupplier()
    else resetForm()
  }
}, { immediate: true })

const initFormFromSupplier = () => {
  Object.assign(formData, {
    id: props.supplier?.id,
    code: props.supplier?.code || '',
    name: props.supplier?.name || '',
    contact_person: props.supplier?.contact_person || '',
    phone: props.supplier?.phone || '',
    email: props.supplier?.email || '',
    address: props.supplier?.address || '',
    status: props.supplier?.status === 'inactive' ? 'inactive' : 'active',
    notes: props.supplier?.notes || ''
  })
}

const resetForm = () => {
  Object.assign(formData, formInitialValues)
}

const validateForm = () => {
  const code = (formData.code || '').trim()
  const name = (formData.name || '').trim()
  const phone = (formData.phone || '').trim()
  const email = (formData.email || '').trim()

  if (code) {
    if (code.length < 2 || code.length > 50) return '供应商编码长度必须在2-50个字符之间'
    if (!/^[\u4e00-\u9fa5A-Za-z0-9-]+$/.test(code)) return '编码只能包含中文、字母、数字和连字符'
  }
  if (!name) return '请输入供应商名称'
  if (name.length > 200) return '供应商名称不能超过200个字符'
  if (phone && !/^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/.test(phone)) return '请输入正确的联系电话（手机号或座机号）'
  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return '请输入正确的邮箱地址'
  return ''
}

const buildPayload = () => ({
  code: (formData.code || '').trim(),
  name: (formData.name || '').trim(),
  contact_person: (formData.contact_person || '').trim(),
  phone: (formData.phone || '').trim(),
  email: (formData.email || '').trim(),
  address: (formData.address || '').trim(),
  status: formData.status,
  notes: (formData.notes || '').trim()
})

const handleSubmit = () => {
  const validationError = validateForm()
  if (validationError) {
    ErrorHandler.showMessage(validationError, '校验失败')
    return
  }

  emit('confirm', buildPayload())
}

const handleClose = () => {
  resetForm()
  emit('update:visible', false)
}
</script>
