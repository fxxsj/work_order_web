<template>
  <div class="flex items-center justify-between rounded-lg bg-gray-100 p-4 dark:bg-dark-800">
    <div class="flex items-center gap-2">
      <Icon
        name="check"
        class="h-5 w-5"
      /><span>已选择 <strong>{{ selectedCount }}</strong> 项</span>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <BaseButton
        v-if="canBatchAssign"
        variant="primary"
        size="sm"
        icon="user"
        :disabled="loading"
        @click="emit('batch-assign')"
      >
        批量分派
      </BaseButton>
      <BaseButton
        v-if="canBatchComplete"
        variant="success"
        size="sm"
        icon="checkCircle"
        :disabled="loading"
        @click="emit('batch-complete')"
      >
        批量完成
      </BaseButton>
      <BaseButton
        v-if="canBatchDelete"
        variant="danger"
        size="sm"
        icon="trash"
        :disabled="loading"
        @click="handleBatchDelete"
      >
        批量删除
      </BaseButton>
      <BaseButton
        v-if="canBatchCancel"
        variant="warning"
        size="sm"
        icon="xCircle"
        :disabled="loading"
        @click="emit('batch-cancel')"
      >
        批量取消
      </BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        :disabled="loading"
        @click="emit('clear-selection')"
      >
        取消选择
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon, BaseButton } from '@/components/common'

defineProps({
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