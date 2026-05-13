<template>
  <div class="batch-action-bar">
    <div class="batch-info"><el-icon><Check /></el-icon><span>已选择 <strong>{{ selectedCount }}</strong> 项</span></div>
    <div class="batch-actions">
      <el-button v-if="canBatchAssign" type="primary" size="small" :loading="loading" :disabled="loading" @click="emit('batch-assign')"><el-icon><User /></el-icon> 批量分派</el-button>
      <el-button v-if="canBatchComplete" type="success" size="small" :loading="loading" :disabled="loading" @click="emit('batch-complete')"><el-icon><CircleCheck /></el-icon> 批量完成</el-button>
      <el-button v-if="canBatchDelete" type="danger" size="small" :loading="loading" :disabled="loading" @click="handleBatchDelete"><el-icon><Delete /></el-icon> 批量删除</el-button>
      <el-button v-if="canBatchCancel" type="warning" size="small" :loading="loading" :disabled="loading" @click="emit('batch-cancel')"><el-icon><CircleClose /></el-icon> 批量取消</el-button>
      <el-button size="small" :loading="loading" :disabled="loading" @click="emit('clear-selection')">取消选择</el-button>
    </div>
  </div>
</template>

<script setup>
import { Check, User, CircleCheck, Delete, CircleClose } from '@element-plus/icons-vue'

const props = defineProps({
  selectedCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['batch-assign', 'batch-complete', 'batch-delete', 'batch-cancel', 'clear-selection'])

const canBatchAssign = true
const canBatchComplete = true
const canBatchDelete = true
const canBatchCancel = true

const handleBatchDelete = () => {
  emit('batch-delete')
}
</script>

<style scoped>
.batch-action-bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f5f7fa; border-radius: 4px; margin-bottom: 16px; }
.batch-info { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #606266; }
.batch-actions { display: flex; gap: 10px; }
</style>
