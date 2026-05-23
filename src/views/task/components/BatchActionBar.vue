<template>
  <div class="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-dark-800">
    <div class="flex items-center gap-2"><Icon name="check" class="h-5 w-5" /><span>已选择 <strong>{{ selectedCount }}</strong> 项</span></div>
    <div class="flex flex-wrap items-center gap-3">
      <button v-if="canBatchAssign" class="btn btn-primary btn-sm" :disabled="loading" @click="emit('batch-assign')"><Icon name="user" class="h-4 w-4" /> 批量分派</button>
      <button v-if="canBatchComplete" class="btn btn-success btn-sm" :disabled="loading" @click="emit('batch-complete')"><Icon name="checkCircle" class="h-4 w-4" /> 批量完成</button>
      <button v-if="canBatchDelete" class="btn btn-danger btn-sm" :disabled="loading" @click="handleBatchDelete"><Icon name="trash" class="h-4 w-4" /> 批量删除</button>
      <button v-if="canBatchCancel" class="btn btn-warning btn-sm" :disabled="loading" @click="emit('batch-cancel')"><Icon name="xCircle" class="h-4 w-4" /> 批量取消</button>
      <button class="btn btn-secondary btn-sm" :disabled="loading" @click="emit('clear-selection')">取消选择</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

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