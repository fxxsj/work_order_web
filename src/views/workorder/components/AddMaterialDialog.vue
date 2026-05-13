<template>
  <el-dialog v-model="dialogVisible" title="添加物料" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="form" label-width="80px">
      <el-form-item label="物料">
        <el-select v-model="form.material_id" placeholder="请选择物料" style="width: 100%;" filterable>
          <el-option v-for="item in materialList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注"><el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注（可选）" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  materialList: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'update:visible'])

const formRef = ref(null)
const form = reactive({ material_id: null, notes: '' })

const dialogVisible = computed({ get: () => props.visible, set: (val) => emit('update:visible', val) })

const handleSubmit = () => { if (form.material_id) emit('submit', { material_id: form.material_id, notes: form.notes }) }
const handleCancel = () => { emit('update:visible', false) }
const handleClose = () => { form.material_id = null; form.notes = '' }
</script>
