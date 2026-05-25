<template>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <button
      v-if="canComplete"
      class="btn btn-success btn-sm"
      @click="emit('complete', task)"
    >
      完成
    </button>
    <span
      v-else-if="task.status !== 'completed'"
      class="text-xs text-gray-400"
    >{{ blockReason }}</span>
    <button
      v-if="task.status !== 'completed' && !task.auto_calculate_quantity"
      class="btn btn-primary btn-sm"
      @click="emit('update', task)"
    >
      更新
    </button>
    <button
      class="btn btn-warning btn-sm"
      @click="emit('assign', task)"
    >
      分派
    </button>
    <button
      v-if="task.status !== 'completed' && !task.is_subtask && !task.subtasks_count"
      class="btn btn-secondary btn-sm"
      @click="emit('split', task)"
    >
      拆分
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({ task: { type: Object, required: true } })
const emit = defineEmits(['complete', 'update', 'assign', 'split'])

const canComplete = computed(() => props.task.status !== 'completed')
const blockReason = computed(() => '')
</script>