<template>
  <el-dialog v-model="visible" title="质检检验" width="600px" @close="visible = false">
    <el-form :model="form" label-width="100px">
      <el-form-item label="合格数量"><el-input-number v-model="form.passed_quantity" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item label="不合格数量"><el-input-number v-model="form.failed_quantity" :min="0" style="width: 100%;" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="handleSubmit">提交</el-button></template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
const props = defineProps({ visible: { type: Boolean, default: false }, data: { type: Object, default: null } })
const emit = defineEmits(['submit', 'update:visible'])
const visible = computed({ get: () => props.visible, set: (v) => emit('update:visible', v) })
const form = reactive({ passed_quantity: 0, failed_quantity: 0, notes: '' })
const handleSubmit = () => emit('submit', { ...form })
</script>
