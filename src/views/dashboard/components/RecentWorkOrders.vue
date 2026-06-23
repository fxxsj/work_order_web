<template>
  <div class="card">
    <div class="card-header flex items-center justify-between">
      <span class="text-sm font-semibold text-gray-900 dark:text-white">最近的施工单</span>
      <button
        class="btn btn-primary btn-sm"
        @click="goTo('/workorders')"
      >
        查看全部
      </button>
    </div>
    <div class="card-body">
      <SummaryTable
        :columns="columns"
        :data="recentOrders"
      >
        <template #cell-status="{ row }">
          <StatusTag
            :status="getWorkOrderUserStatus(row)"
            :label="row.status_display"
            category="workOrderUser"
            size="small"
          />
        </template>
        <template #cell-progress="{ row }">
          <ProgressBar
            :percentage="row.progress_percentage || 0"
            :status="row.progress_percentage === 100 ? 'success' : 'active'"
          />
        </template>
        <template #cell-delivery_date="{ row }">
          {{ formatDate(row.delivery_date) }}
        </template>
        <template #cell-actions="{ row }">
          <button
            class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
            @click="goTo(`/workorders/${row.id}`)"
          >
            查看
          </button>
        </template>
      </SummaryTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { StatusTag, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'
import { formatDate } from '@/utils/filter'
import { getWorkOrderUserStatus } from '@/constants/statusMeta'

defineProps({ recentOrders: { type: Array as any, default: () => [] } })
const router = useRouter()
const goTo = (path: any) => router.push(path)

const columns: Column[] = [
  { key: 'order_number', label: '施工单号', class: 'w-36' },
  { key: 'customer_name', label: '客户', class: 'w-28' },
  { key: 'product_name', label: '产品名称', class: 'min-w-36 max-w-xs truncate' },
  { key: 'status', label: '状态', class: 'w-24' },
  { key: 'progress', label: '进度', class: 'w-36' },
  { key: 'delivery_date', label: '交货日期', class: 'w-28' },
  { key: 'actions', label: '操作', class: 'w-24' },
]
</script>
