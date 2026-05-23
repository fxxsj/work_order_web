<template>
  <div>
    <EmptyState v-if="!items || items.length === 0" :title="emptyText" />
    <template v-if="!items || items.length === 0">
      <button v-if="!disabled" class="btn btn-primary btn-sm mt-3" @click="handleAdd"><Icon name="plus" class="h-3 w-3" /> {{ addButtonText }}</button>
    </template>
    <div v-else>
      <div class="mb-3 flex items-center justify-between"><span class="font-bold">{{ title }}（{{ items.length }}）</span><button v-if="!disabled" class="btn btn-primary btn-sm" @click="handleAdd"><Icon name="plus" class="h-3 w-3" /> 添加</button></div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr class="border-b border-gray-200 bg-gray-50 dark:border-dark-700 dark:bg-dark-800">
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">{{ nameLabel }}</th>
              <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">版本</th>
              <th class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">确认状态</th>
              <th class="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">备注</th>
              <th v-if="!disabled" class="px-3 py-2 text-center font-medium text-gray-600 dark:text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in items" :key="index" class="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-dark-800 dark:hover:bg-dark-800">
              <td class="px-3 py-2">{{ row.name }}</td>
              <td class="px-3 py-2 text-center">{{ row.version }}</td>
              <td class="px-3 py-2 text-center"><Tag :type="row.confirmed ? 'success' : 'warning'" size="small">{{ row.confirmed ? '已确认' : '待确认' }}</Tag></td>
              <td class="max-w-[200px] truncate px-3 py-2">{{ row.notes }}</td>
              <td v-if="!disabled" class="px-3 py-2 text-center"><button class="text-sm text-danger-600 hover:underline" @click="handleRemove(index)">删除</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon, Tag, EmptyState } from '@/components/common'

const props = defineProps({
  items: { type: Array as any, default: () => [] },
  title: { type: String, default: '列表' },
  nameLabel: { type: String, default: '名称' },
  emptyText: { type: String, default: '暂无数据' },
  addButtonText: { type: String, default: '添加' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove'])

const handleAdd = () => emit('add')
const handleRemove = (index: any) => emit('remove', index)
</script>
