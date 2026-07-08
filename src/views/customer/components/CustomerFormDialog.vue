<template>
  <BaseDialog
    :show="isOpen"
    :title="dialogTitle"
    width="normal"
    @close="handleClose"
  >
    <form
      id="customer-form"
      class="space-y-5"
      @submit.prevent="handleSubmit"
    >
      <Input
        v-model="formData.name"
        label="客户名称"
        required
        placeholder="请输入客户名称"
        :error="nameError"
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
      <div>
        <label class="input-label mb-1.5 block">业务员</label>
        <Select
          v-model="formData.salesperson"
          placeholder="请选择业务员"
          :options="salespersonOptions"
          filterable
          clearable
        />
      </div>
      <div>
        <label class="input-label mb-1.5 block">默认税率 (%)</label>
        <InputNumber
          v-model="formData.default_tax_rate"
          :min="0"
          :max="100"
          :precision="2"
          placeholder="请输入默认税率"
        />
      </div>
      <TextArea
        v-model="formData.address"
        label="地址"
        placeholder="请输入地址"
        :rows="2"
      />
      <TextArea
        v-model="formData.notes"
        label="备注"
        placeholder="请输入备注"
        :rows="3"
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
          form="customer-form"
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
import { customerAPI } from '@/api/modules'
import { BaseDialog, Input, InputNumber, Select, TextArea } from '@/components/common'
import { useUIStore } from '@/stores/ui'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  customer: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  salespersonOptions: { type: Array as any, default: () => [] }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formInitialValues = { name: '', contact_person: '', phone: '', email: '', address: '', salesperson: null as any, default_tax_rate: 13, notes: '' }
const formData = reactive({ ...formInitialValues })
const nameError = ref('')
const isOpen = ref(false)

const isEditMode = computed(() => props.dialogType === 'edit')
const dialogTitle = computed(() => isEditMode.value ? '编辑客户' : '新建客户')

watch(() => props.visible, (val) => {
  isOpen.value = val
  if (val) {
    if (isEditMode.value && props.customer) initFormFromCustomer()
    else resetForm()
  }
}, { immediate: true })

watch(() => formData.name, () => {
  if (nameError.value) nameError.value = ''
})

const initFormFromCustomer = () => {
  Object.assign(formData, {
    name: props.customer?.name || '',
    contact_person: props.customer?.contact_person || '',
    phone: props.customer?.phone || '',
    email: props.customer?.email || '',
    address: props.customer?.address || '',
    salesperson: props.customer?.salesperson || null,
    default_tax_rate: props.customer?.default_tax_rate ?? 13,
    notes: props.customer?.notes || ''
  })
  nameError.value = ''
}

const resetForm = () => {
  Object.assign(formData, formInitialValues)
  nameError.value = ''
}

const handleSubmit = async () => {
  const name = (formData.name || '').trim()
  const phone = (formData.phone || '').trim()

  if (!name) {
    nameError.value = '请输入客户名称'
    return
  }
  if (name.length < 2) {
    nameError.value = '客户名称长度需至少2个字符'
    return
  }
  if (name.length > 200) {
    nameError.value = '客户名称长度不能超过200个字符'
    return
  }
  if (phone && !/^[\d\-+() ]+$/.test(phone)) {
    useUIStore().showWarning('电话号码格式不正确，只能包含数字和-+()空格')
    return
  }

  const excludeId = isEditMode.value ? props.customer?.id : undefined
  const exists = await customerAPI.checkName(name, excludeId)
  if (exists) {
    nameError.value = '该客户名称已存在'
    return
  }

  emit('confirm', { ...formData, name, phone })
}

const setNameError = (message: string) => {
  nameError.value = message
}

const handleClose = () => {
  resetForm()
  emit('update:visible', false)
}

defineExpose({ setNameError })
</script>
