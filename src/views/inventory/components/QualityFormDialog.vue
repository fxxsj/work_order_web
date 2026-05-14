<template>
  <el-dialog v-model="visible" title="质检表单" width="var(--ui-dialog-width-md)" @close="visible = false">
    <el-form :model="form" label-width="100px">
      <el-form-item label="产品"><el-input :value="data?.product_name" disabled /></el-form-item>
      <el-form-item label="检验结果"><el-select v-model="form.status" style="width: 100%;"><el-option label="待检验" value="pending" /><el-option label="合格" value="passed" /><el-option label="不合格" value="failed" /></el-select></el-form-item>
    </el-form>
    <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交</el-button></template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['submit', 'update:visible'])
const visible = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) })
const form = reactive({ status: 'pending' })
const handleSubmit = () => emit('submit', { ...form })
</script>
