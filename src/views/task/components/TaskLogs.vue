<template>
  <div v-if="task.logs?.length" class="rounded-xl bg-gray-100 p-6 dark:bg-dark-800">
    <div class="mb-3 font-bold text-primary-600">{{ task.work_content }} - 操作记录（{{ task.logs.length }}条）</div>
    <div class="overflow-x-auto">
      <table class="data-table w-full">
        <thead>
          <tr>
            <th class="w-40">操作时间</th>
            <th class="w-32">操作人</th>
            <th class="w-28">操作类型</th>
            <th class="w-44">数量变化</th>
            <th class="w-40">状态变化</th>
            <th class="min-w-52">操作内容</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in task.logs" :key="log.id">
            <td>{{ formatDateTime(log.created_at) }}</td>
            <td>{{ log.operator_name }}</td>
            <td>{{ log.log_type_display }}</td>
            <td>
              <span v-if="log.quantity_before !== null && log.quantity_after !== null">{{ log.quantity_before }} → {{ log.quantity_after }}
                <span v-if="log.quantity_increment > 0" class="ml-1 font-bold text-success-600">(+{{ log.quantity_increment }})</span>
                <span v-else-if="log.quantity_increment < 0" class="ml-1 font-bold text-danger-600">({{ log.quantity_increment }})</span>
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span v-if="log.status_before && log.status_after">{{ getStatusText(log.status_before) }} → {{ getStatusText(log.status_after) }}</span>
              <span v-else>-</span>
            </td>
            <td>{{ log.content }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="py-6 text-center text-gray-400">暂无操作记录</div>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/utils/filter'

const props = defineProps({ task: { type: Object, required: true } })
const getStatusText = (s: any) => ({ pending: '待开始', in_progress: '进行中', completed: '已完成', cancelled: '已取消' } as any)[s] || s
</script>
