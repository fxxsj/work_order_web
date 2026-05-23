<template>
  <div class="flex h-full flex-col rounded-xl bg-gray-100 overflow-hidden dark:bg-dark-800">
    <div class="flex items-center justify-between rounded-t-xl p-4 font-bold text-white" :class="headerGradient">
      <span class="text-base">{{ title }}</span>
      <span class="rounded-lg bg-white/30 px-2 py-1 text-sm font-bold">{{ taskCount }}</span>
    </div>
    <div v-loading="loading" class="flex-1 overflow-y-auto p-4" style="max-height: min(640px, calc(100vh - 350px))">
      <task-card v-for="task in tasks" :key="task.id" :task="task" :editable="editable" @click="handleTaskClick" @update="handleTaskUpdate" @assign="handleTaskAssign" @complete="handleTaskComplete" />
      <div v-if="tasks.length === 0" class="py-10 text-center text-gray-400">
        <Icon name="inbox" class="mx-auto mb-3 h-12 w-12" />
        <p class="m-0 text-sm">{{ emptyText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/common'
import TaskCard from './TaskCard.vue'

const props = defineProps({ status: { type: String, required: true }, title: { type: String, required: true }, tasks: { type: Array as any, default: () => [] }, editable: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['task-click', 'task-update', 'task-assign', 'task-complete'])

const taskCount = computed(() => props.tasks.length)
const headerGradient = computed(() => ({ pending: 'bg-gradient-to-br from-gray-500 to-gray-600', in_progress: 'bg-gradient-to-br from-blue-500 to-blue-600', completed: 'bg-gradient-to-br from-green-500 to-green-600' })[props.status] || 'bg-gradient-to-br from-gray-500 to-gray-600');
const emptyText = computed(() => ({ pending: '暂无待开始任务', in_progress: '暂无进行中任务', completed: '暂无已完成任务' })[props.status] || '暂无任务');

const handleTaskClick = (t: any) => emit('task-click', t)
const handleTaskUpdate = (t: any) => emit('task-update', t)
const handleTaskAssign = (t: any) => emit('task-assign', t)
const handleTaskComplete = (t: any) => emit('task-complete', t)
</script>