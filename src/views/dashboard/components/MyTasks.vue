<template>
  <div class="card">
    <div class="card-header flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-900 dark:text-white">我的待处理任务</span>
      <button class="btn btn-primary btn-sm" @click="emit('view-all')">查看全部</button>
    </div>
    <div class="card-body overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
            <th class="px-3 py-2 w-36">施工单号</th>
            <th class="px-3 py-2 min-w-48">任务内容</th>
            <th class="px-3 py-2 w-24">状态</th>
            <th class="px-3 py-2 w-36">进度</th>
            <th class="px-3 py-2 w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
          <tr v-for="row in tasks" :key="row.id" class="hover:bg-gray-50 dark:hover:bg-dark-800">
            <td class="px-3 py-2">
              <button v-if="row.work_order_process_info?.work_order?.id" class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="goTo(`/workorders/${row.work_order_process_info.work_order.id}`)">{{ row.work_order_process_info.work_order.order_number || '-' }}</button>
              <span v-else>-</span>
            </td>
            <td class="px-3 py-2 truncate max-w-xs">{{ row.work_content }}</td>
            <td class="px-3 py-2"><StatusTag :status="row.status" :label="row.status_display" category="task" size="small" /></td>
            <td class="px-3 py-2"><ProgressBar :percentage="getProgress(row)" :color="getProgress(row) === 100 ? '#67C23A' : '#409EFF'" /></td>
            <td class="px-3 py-2"><button class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="goTo('/tasks')">详情</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { StatusTag } from '@/components/common'

defineProps({ tasks: { type: Array as any, default: () => [] } })
const emit = defineEmits(['view-all'])
const router = useRouter()
const goTo = (path: any) => router.push(path)

const getProgress = (t: any) => t.production_quantity ? Math.round(((t.quantity_completed || 0) / t.production_quantity) * 100) : 0
</script>
