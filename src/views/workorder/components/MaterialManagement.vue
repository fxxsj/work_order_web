<template>
  <div class="card mt-6">
    <div class="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-dark-700">
      <span class="font-bold">物料信息</span>
      <button v-if="editable" class="btn btn-primary btn-sm" @click="emit('add-material')"><Icon name="plus" class="h-3 w-3" /> 添加物料</button>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">物料名称</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">尺寸</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">用量</th>
            <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">备注</th>
            <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">采购状态</th>
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
            <td class="px-3 py-2 text-center"><StatusTag :status="row.purchase_status" category="materialPurchase" size="small" /></td>
            <td class="px-3 py-2">{{ formatDate(row.purchase_date) }}</td>
            <td class="px-3 py-2 text-center"><button class="btn btn-primary btn-sm" :disabled="!editable" @click="emit('update-status', row)">更新状态</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon, StatusTag } from '@/components/common'
import { formatDate } from '@/utils/filter'

const props = defineProps({ materials: { type: Array as any, default: () => [] }, editable: { type: Boolean, default: false } })
const emit = defineEmits(['add-material', 'update-status'])
</script>
