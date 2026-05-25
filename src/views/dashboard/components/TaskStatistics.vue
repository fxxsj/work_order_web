<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div
      class="stat-card cursor-pointer"
      @click="emit('navigate', {})"
    >
      <div class="stat-icon stat-icon-gray">
        <Icon
          name="list"
          class="h-6 w-6"
        />
      </div>
      <div>
        <div class="stat-value">
          {{ taskStatistics.total_count || 0 }}
        </div>
        <div class="stat-label">
          任务总数
        </div>
      </div>
    </div>
    <div
      class="stat-card cursor-pointer"
      @click="emit('navigate', { status: 'pending' })"
    >
      <div class="stat-icon stat-icon-gray">
        <Icon
          name="clock"
          class="h-6 w-6"
        />
      </div>
      <div>
        <div class="stat-value">
          {{ taskStatusCount.pending || 0 }}
        </div>
        <div class="stat-label">
          待开始任务
        </div>
      </div>
    </div>
    <div
      class="stat-card cursor-pointer"
      @click="emit('navigate', { status: 'in_progress' })"
    >
      <div class="stat-icon stat-icon-warning">
        <Icon
          name="loading"
          class="h-6 w-6"
        />
      </div>
      <div>
        <div class="stat-value">
          {{ taskStatusCount.in_progress || 0 }}
        </div>
        <div class="stat-label">
          进行中任务
        </div>
      </div>
    </div>
    <div
      class="stat-card cursor-pointer"
      @click="emit('navigate', { status: 'completed' })"
    >
      <div class="stat-icon stat-icon-success">
        <Icon
          name="checkCircle"
          class="h-6 w-6"
        />
      </div>
      <div>
        <div class="stat-value">
          {{ taskStatusCount.completed || 0 }}
        </div>
        <div class="stat-label">
          已完成任务
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({ taskStatistics: { type: Object, default: () => ({}) }, taskStatusCount: { type: Object, default: () => ({}) } })
const emit = defineEmits(['navigate'])
</script>
