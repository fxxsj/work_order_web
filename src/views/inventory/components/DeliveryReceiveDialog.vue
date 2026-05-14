<template>
  <el-dialog v-model="dialogVisible" title="签收确认" width="var(--ui-dialog-width-md)" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="签收状态" prop="received"><el-radio-group v-model="form.received"><el-radio label="received">正常签收</el-radio><el-radio label="rejected">拒收</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="form.received === 'rejected'" label="拒收原因" prop="received_notes"><el-input v-model="form.received_notes" type="textarea" :rows="3" placeholder="请输入拒收原因" maxlength="500" show-word-limit /></el-form-item>
    </el-form>
    <template #footer><el-button @click="handleClose">取消</el-button><el-button type="primary" @click="handleSubmit">确认</el-button></template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({ visible: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ received: 'received', received_notes: '' })
const rules = { received: [{ required: true, message: '请选择签收状态', trigger: 'change' }] }

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })
const handleSubmit = () => emit('submit', { ...form })
const handleClose = () => { form.received = 'received'; form.received_notes = '' }
</script>
