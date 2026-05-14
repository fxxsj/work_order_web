<template>
  <el-dialog v-model="dialogVisible" title="添加工序" width="var(--ui-dialog-width-sm)" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="工序">
        <el-select v-model="form.process_id" placeholder="请选择工序" style="width: 100%;">
          <el-option v-for="process in processList" :key="process.id" :label="process.name" :value="process.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="顺序"><el-input-number v-model="form.sequence" :min="1" :max="100" style="width: 100%;" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  processList: { type: Array, default: () => [] },
  nextSequence: { type: Number, default: 1 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ process_id: null, sequence: 1 })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

watch(() => props.visible, (val) => { if (val) form.sequence = props.nextSequence })

const handleSubmit = () => { if (form.process_id) emit('submit', { process_id: form.process_id, sequence: form.sequence }) }
const handleCancel = () => { emit('update:visible', false) }
const handleClose = () => { form.process_id = null }
</script>
