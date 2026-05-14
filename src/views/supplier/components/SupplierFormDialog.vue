<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="var(--ui-dialog-width-md)" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="供应商编码" prop="code">
        <el-input v-model="form.code" placeholder="请输入供应商编码" :disabled="isEditMode" />
      </el-form-item>
      <el-form-item label="供应商名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入供应商名称" />
      </el-form-item>
      <el-form-item label="联系人" prop="contact_person">
        <el-input v-model="form.contact_person" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="form.address" type="textarea" :rows="3" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio label="active">启用</el-radio>
          <el-radio label="inactive">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  dialogType: { type: String, default: 'create' },
  supplier: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'update:visible'])

const formRef = ref(null)

const FORM_INITIAL = {
  code: '', name: '', contact_person: '', phone: '', email: '', address: '', status: 'active', notes: ''
}

const form = reactive({ ...FORM_INITIAL })

const rules = {
  code: [
    { required: true, message: '请输入供应商编码', trigger: 'blur' },
    { min: 2, max: 50, message: '编码长度在2-50个字符之间', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]+$/, message: '编码只能包含字母、数字和连字符', trigger: 'blur' }
  ],
  name: [{ required: true, message: '请输入供应商名称', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的联系电话', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }]
}

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const dialogTitle = computed(() => props.dialogType === 'edit' ? '编辑供应商' : '新增供应商')
const isEditMode = computed(() => props.dialogType === 'edit')

watch(() => props.visible, (val) => {
  if (val) {
    if (props.dialogType === 'edit' && props.supplier) initFormFromSupplier()
    else resetForm()
  }
})

const initFormFromSupplier = () => {
  if (!props.supplier) return
  Object.assign(form, {
    id: props.supplier.id,
    code: props.supplier.code || '',
    name: props.supplier.name || '',
    contact_person: props.supplier.contact_person || '',
    phone: props.supplier.phone || '',
    email: props.supplier.email || '',
    address: props.supplier.address || '',
    status: props.supplier.status || 'active',
    notes: props.supplier.notes || ''
  })
  nextTick(() => { formRef.value?.clearValidate() })
}

const resetForm = () => {
  Object.assign(form, FORM_INITIAL)
  nextTick(() => { formRef.value?.clearValidate() })
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) emit('confirm', { ...form })
  })
}

const handleClose = () => { resetForm(); emit('update:visible', false) }
</script>
