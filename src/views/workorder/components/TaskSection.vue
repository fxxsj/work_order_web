<template>
  <div class="p-3">
    <LoadingSpinner v-if="loading" size="lg" class="mx-auto my-8 block" />
    <template v-else>
      <div class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
        <div class="rounded-xl bg-blue-50 p-4 text-center dark:bg-blue-900/20"><div class="text-2xl font-bold text-blue-600">{{ taskStats.total }}</div><div class="text-xs text-gray-500">全部任务</div></div>
        <div class="rounded-xl bg-gray-100 p-4 text-center dark:bg-dark-700"><div class="text-2xl font-bold text-gray-500">{{ taskStats.draft }}</div><div class="text-xs text-gray-500">草稿</div></div>
        <div class="rounded-xl bg-yellow-50 p-4 text-center dark:bg-yellow-900/20"><div class="text-2xl font-bold text-yellow-600">{{ taskStats.pending }}</div><div class="text-xs text-gray-500">待处理</div></div>
        <div class="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20"><div class="text-2xl font-bold text-green-600">{{ taskStats.completed }}</div><div class="text-xs text-gray-500">已完成</div></div>
        <div class="rounded-xl bg-primary-50 p-4 text-center dark:bg-primary-900/20"><CircularProgress :percentage="taskStats.progress || 0" :size="60" :stroke-width="8" /><div class="mt-1 text-xs text-gray-500">完成进度</div></div>
      </div>
      <div class="overflow-x-auto">
        <table class="mt-2 w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
              <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">ID</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">任务内容</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">类型</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">状态</th>
              <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in tasks" :key="row.id" class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
              <td class="px-3 py-2 text-center">{{ row.id }}</td>
              <td class="px-3 py-2">{{ row.work_content }}</td>
              <td class="px-3 py-2">{{ row.task_type_display }}</td>
              <td class="px-3 py-2"><StatusTag :status="row.status" category="task" :label="row.status_display" size="small" /></td>
              <td class="px-3 py-2 text-center">{{ row.production_quantity }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { StatusTag, CircularProgress, LoadingSpinner } from '@/components/common'

const props = defineProps({ tasks: { type: Array as any, default: () => [] }, taskStats: { type: Object, default: () => ({}) }, loading: { type: Boolean, default: false } })
</script>
