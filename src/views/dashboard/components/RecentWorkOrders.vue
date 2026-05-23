<template>
  <div class="card">
    <div class="card-header flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-900 dark:text-white">最近的施工单</span>
      <button class="btn btn-primary btn-sm" @click="goTo('/workorders')">查看全部</button>
    </div>
    <div class="card-body overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
            <th class="px-3 py-2 w-36">施工单号</th>
            <th class="px-3 py-2 w-28">客户</th>
            <th class="px-3 py-2 min-w-36">产品名称</th>
            <th class="px-3 py-2 w-24">状态</th>
            <th class="px-3 py-2 w-36">进度</th>
            <th class="px-3 py-2 w-28">交货日期</th>
            <th class="px-3 py-2 w-24">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
          <tr v-for="row in recentOrders" :key="row.id" class="hover:bg-gray-50 dark:hover:bg-dark-800">
            <td class="px-3 py-2">{{ row.order_number }}</td>
            <td class="px-3 py-2">{{ row.customer_name }}</td>
            <td class="px-3 py-2 truncate max-w-xs">{{ row.product_name }}</td>
            <td class="px-3 py-2"><StatusTag :status="row.status" :label="row.status_display" category="workOrder" size="small" /></td>
            <td class="px-3 py-2"><ProgressBar :percentage="row.progress_percentage || 0" :color="row.progress_percentage === 100 ? '#67C23A' : '#409EFF'" /></td>
            <td class="px-3 py-2">{{ formatDate(row.delivery_date) }}</td>
            <td class="px-3 py-2"><button class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400" @click="goTo(`/workorders/${row.id}`)">查看</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'

defineProps({ recentOrders: { type: Array as any, default: () => [] } })
const router = useRouter()
const goTo = (path: any) => router.push(path)
</script>
