<template>
  <div class="mt-6 overflow-x-auto">
    <table class="data-table w-full">
      <thead>
        <tr>
          <th class="w-20 text-center">任务ID</th>
          <th class="min-w-40">任务名称</th>
          <th class="w-28">操作员</th>
          <th class="w-28 text-center">状态</th>
          <th class="w-32 text-center">进度</th>
          <th class="w-28 text-right">完成数量</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in tasks" :key="row.id">
          <td class="text-center">{{ row.id }}</td>
          <td>{{ row.work_content || row.task_name || '-' }}</td>
          <td>{{ row.assigned_operator_name || row.operator_name || '-' }}</td>
          <td class="text-center"><StatusTag :status="row.status" category="task" :label="row.status_display" size="small" /></td>
          <td class="text-center"><ProgressBar :percentage="calculateTaskProgress(row)" :color="getProgressColor(row)" /></td>
          <td class="text-right">{{ row.quantity_completed || 0 }} / {{ row.production_quantity || 0 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { StatusTag } from '@/components/common'

const props = defineProps({ tasks: { type: Array as any, default: () => [] } })

const calculateTaskProgress = (t: any) => t.production_quantity ? Math.round(((t.quantity_completed || 0) / t.production_quantity) * 100) : 0
const getProgressColor = (t: any) => calculateTaskProgress(t) === 100 ? 'var(--ui-color-success)' : 'var(--ui-color-primary)'
</script>
