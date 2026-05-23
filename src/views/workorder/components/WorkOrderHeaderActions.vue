<template>
  <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
    <button class="btn btn-secondary" @click="emit('back')"><Icon name="arrowLeft" class="h-4 w-4" /> 返回</button>
    <div class="flex flex-wrap items-center gap-3">
      <button class="btn btn-secondary" @click="emit('print')"><Icon name="printer" class="h-4 w-4" /> 打印</button>
      <button v-if="canEdit" class="btn btn-primary" @click="emit('edit')"><Icon name="edit" class="h-4 w-4" /> 编辑</button>
      <select class="select btn btn-success" @change="handleStatusChange">
        <option value="pending">待开始</option>
        <option value="in_progress">进行中</option>
        <option value="paused">已暂停</option>
        <option value="completed">已完成</option>
        <option value="cancelled">已取消</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'

const props = defineProps({ canEdit: { type: Boolean, default: false } })
const emit = defineEmits(['back', 'print', 'edit', 'status-change'])
const handleStatusChange = (e: any) => emit('status-change', e.target.value)
</script>