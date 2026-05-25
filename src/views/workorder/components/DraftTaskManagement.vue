<template>
  <div v-if="showDraftTasks" class="card mt-6">
    <div class="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-dark-700">
      <span class="font-bold">草稿任务管理</span>
      <Tag type="info" size="small">{{ draftTasks.length }} 个草稿任务</Tag>
    </div>
    <Alert title="提示" type="info" description="草稿任务是系统自动生成的任务预览，您可以在审核前批量编辑或删除这些任务。" :closable="false" :show-icon="true" class="mb-4" />
    <SummaryTable :columns="columns" :data="draftTasks" />
  </div>
</template>

<script setup lang="ts">
import { Tag, Alert, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

defineProps({ draftTasks: { type: Array as any, default: () => [] }, showDraftTasks: { type: Boolean, default: false } })

const columns: Column[] = [
  { key: 'id', label: '任务ID', width: 80, align: 'center' },
  { key: 'work_content', label: '任务内容' },
  { key: 'task_type_display', label: '任务类型', width: 120 },
  { key: 'production_quantity', label: '数量', width: 80, align: 'center' },
  { key: 'status_display', label: '状态', width: 96 },
]
</script>
