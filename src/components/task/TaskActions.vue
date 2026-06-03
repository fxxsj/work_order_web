<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <BaseButton
      v-if="canComplete"
      variant="success"
      size="sm"
      @click="emit('complete', task)"
    >
      完成
    </BaseButton>
    <span
      v-else-if="task.status !== 'completed'"
      class="text-xs text-gray-400"
    >{{ blockReason }}</span>
    <BaseButton
      v-if="task.status !== 'completed' && !task.auto_calculate_quantity"
      variant="primary"
      size="sm"
      @click="emit('update', task)"
    >
      更新
    </BaseButton>
    <BaseButton
      variant="warning"
      size="sm"
      @click="emit('assign', task)"
    >
      分派
    </BaseButton>
    <BaseButton
      v-if="task.status !== 'completed' && !task.is_subtask && !task.subtasks_count"
      variant="secondary"
      size="sm"
      @click="emit('split', task)"
    >
      拆分
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseButton } from '@/components/common'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['complete', 'update', 'assign', 'split'])

const canComplete = computed(() => props.task.status !== 'completed')
const blockReason = computed(() => '')
</script>