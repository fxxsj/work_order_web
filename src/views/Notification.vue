<template>
  <div class="card">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span class="font-bold">通知中心</span>
      <div class="flex flex-wrap items-center gap-3">
        <button v-if="unreadCount > 0" class="btn btn-primary btn-sm" :disabled="markingAll" @click="markAllRead">标记全部已读</button>
        <button class="btn btn-secondary btn-sm" @click="loadData"><Icon name="refresh" class="h-3 w-3" /> 刷新</button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-50 text-left text-xs uppercase text-gray-500 dark:bg-dark-800 dark:text-gray-400">
            <th class="px-4 py-3 w-20 text-center">状态</th>
            <th class="px-4 py-3 w-32">类型</th>
            <th class="px-4 py-3 min-w-48">标题</th>
            <th class="px-4 py-3 min-w-64">内容</th>
            <th class="px-4 py-3 w-40">时间</th>
            <th class="px-4 py-3 w-36">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
          <tr v-for="row in notificationList" :key="row.id" :class="[!row.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : '']">
            <td class="px-4 py-3 text-center">
              <span v-if="!row.is_read" class="relative flex justify-center"><span class="h-2 w-2 rounded-full bg-primary-500"></span></span>
              <span v-else class="text-gray-400">已读</span>
            </td>
            <td class="px-4 py-3">{{ row.notification_type_display }}</td>
            <td class="px-4 py-3">{{ row.title }}</td>
            <td class="px-4 py-3 truncate max-w-xs">{{ row.content }}</td>
            <td class="px-4 py-3">{{ formatDateTime(row.created_at) }}</td>
            <td class="px-4 py-3">
              <button class="btn btn-ghost btn-sm text-primary-600" @click="handleClick(row)">查看</button>
              <button v-if="!row.is_read" class="btn btn-ghost btn-sm text-primary-600" @click="markRead(row)">标记已读</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@/components/common'
import { formatDateTime } from '@/utils/filter'

defineProps({
  notificationList: { type: Array as any, default: () => [] },
  unreadCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  markingAll: { type: Boolean, default: false }
})

const emit = defineEmits(['mark-read', 'mark-all-read', 'click', 'refresh'])
const getRowClassName = (payload: any) => { const { row } = payload; return row.is_read ? '' : 'bg-primary-50/50' }
const markRead = (row: any) => emit('mark-read', row)
const markAllRead = () => emit('mark-all-read')
const handleClick = (row: any) => emit('click', row)
const loadData = () => emit('refresh')
</script>