<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <div class="stat-card cursor-pointer" @click="emit('navigate', {})">
      <div class="stat-icon stat-icon-primary">
        <Icon name="document" class="h-6 w-6" />
      </div>
      <div>
        <div class="stat-value">{{ statistics.total_count || 0 }}</div>
        <div class="stat-label">施工单总数</div>
      </div>
    </div>
    <div class="stat-card cursor-pointer" @click="emit('navigate', { status: 'completed' })">
      <div class="stat-icon stat-icon-success">
        <Icon name="checkCircle" class="h-6 w-6" />
      </div>
      <div>
        <div class="stat-value">{{ getStatusCount('completed') }}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>
    <div class="stat-card cursor-pointer" @click="emit('navigate', { status: 'in_progress' })">
      <div class="stat-icon stat-icon-warning">
        <Icon name="loading" class="h-6 w-6" />
      </div>
      <div>
        <div class="stat-value">{{ getStatusCount('in_progress') }}</div>
        <div class="stat-label">进行中</div>
      </div>
    </div>
    <div class="stat-card cursor-pointer" @click="emit('navigate', { status: 'pending' })">
      <div class="stat-icon stat-icon-gray">
        <Icon name="clock" class="h-6 w-6" />
      </div>
      <div>
        <div class="stat-value">{{ getStatusCount('pending') }}</div>
        <div class="stat-label">待开始</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

defineProps({ statistics: { type: Object, default: () => ({}) } })
const emit = defineEmits(['navigate'])
const getStatusCount = (status: any) => 0 // Placeholder
</script>
