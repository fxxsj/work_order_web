<template>
  <div class="mt-6">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3 font-bold">
      <span>物料信息</span>
      <button class="btn btn-primary btn-sm" @click="emit('add-material')"><Icon name="plus" class="h-3 w-3" /> 添加物料</button>
    </div>
    <div v-if="materials?.length" class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">物料名称</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">尺寸</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">用量</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">备注</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">采购状态</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">采购日期</th>
            <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in materials" :key="row.id || row.material_code" class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
            <td class="px-3 py-2">{{ row.material_name }} ({{ row.material_code }})</td>
            <td class="px-3 py-2">{{ row.material_size }}</td>
            <td class="px-3 py-2">{{ row.material_usage }}</td>
            <td class="max-w-[200px] truncate px-3 py-2">{{ row.notes || '-' }}</td>
            <td class="px-3 py-2"><StatusTag :status="row.purchase_status" :label="row.purchase_status_display" category="materialPurchase" size="small" /></td>
            <td class="px-3 py-2">{{ formatDate(row.purchase_date) }}</td>
            <td class="px-3 py-2 text-center"><button class="btn btn-ghost btn-sm text-primary-600" @click="emit('update-material', row)">编辑</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-else title="暂无物料" />
  </div>
</template>

<script setup lang="ts">
import { Icon, StatusTag, EmptyState } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({ materials: { type: Array as any, default: () => [] } })
const emit = defineEmits(['add-material', 'update-material'])
</script>
