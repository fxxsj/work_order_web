<template>
  <div>
    <div v-if="items.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-xs uppercase text-gray-500 dark:text-gray-400">
            <th class="px-3 py-2">编码</th>
            <th class="px-3 py-2">名称</th>
            <th class="px-3 py-2 w-20">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-dark-700">
          <tr v-for="row in items.slice(0, 5)" :key="row.id">
            <td class="px-3 py-2 truncate max-w-xs">{{ row.code }}</td>
            <td class="px-3 py-2 truncate max-w-xs">{{ row.name }}</td>
            <td class="px-3 py-2">
              <button
                class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
                :disabled="confirmingItem === `${type}-${row.id}`"
                @click="emit('confirm', { type, item: row })"
              >
                <svg v-if="confirmingItem === `${type}-${row.id}`" class="-ml-1 mr-1 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                确认
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="items.length > 5" class="mt-1 text-center text-xs text-gray-500 dark:text-dark-400">还有 {{ items.length - 5 }} 项...</div>
    </div>
    <EmptyState v-else :title="`暂无待确认${typeLabel}`" />
  </div>
</template>

<script setup lang="ts">
import { EmptyState } from '@/components/common'

const props = defineProps({ items: { type: Array as any, default: () => [] }, type: { type: String, default: 'artwork' }, typeLabel: { type: String, default: '图稿' }, confirmingItem: { type: String as () => string | null, default: null } })
const emit = defineEmits(['confirm'])
</script>
