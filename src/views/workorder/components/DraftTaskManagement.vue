<template>
  <div v-if="showDraftTasks" class="card mt-6">
    <div class="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3 dark:border-dark-700">
      <span class="font-bold">草稿任务管理</span>
      <Tag type="info" size="small">{{ draftTasks.length }} 个草稿任务</Tag>
    </div>
    <Alert title="提示" type="info" description="草稿任务是系统自动生成的任务预览，您可以在审核前批量编辑或删除这些任务。" :closable="false" :show-icon="true" class="mb-4" />
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
            <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">任务ID</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">任务内容</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">任务类型</th>
            <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">数量</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in draftTasks" :key="row.id" class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
            <td class="px-3 py-2 text-center">{{ row.id }}</td>
            <td class="px-3 py-2">{{ row.work_content }}</td>
            <td class="px-3 py-2">{{ row.task_type_display }}</td>
            <td class="px-3 py-2 text-center">{{ row.production_quantity }}</td>
            <td class="px-3 py-2">{{ row.status_display }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tag, Alert } from '@/components/common'

const props = defineProps({ draftTasks: { type: Array as any, default: () => [] }, showDraftTasks: { type: Boolean, default: false } })
const emit = defineEmits(['selection-change'])
</script>
