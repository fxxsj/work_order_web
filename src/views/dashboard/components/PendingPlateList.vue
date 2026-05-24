<template>
  <div>
    <div v-if="items.length > 0">
      <SummaryTable :columns="columns" :data="visibleItems">
        <template #cell-actions="{ row }">
          <button
            class="btn btn-ghost btn-sm text-primary-600 dark:text-primary-400"
            :disabled="confirmingItem === `${type}-${row.id}`"
            @click="emit('confirm', { type, item: row })"
          >
            <Icon
              v-if="confirmingItem === `${type}-${row.id}`"
              name="refresh"
              class="-ml-1 mr-1 inline h-3 w-3 animate-spin"
            />
            确认
          </button>
        </template>
      </SummaryTable>
      <div v-if="items.length > 5" class="mt-1 text-center text-xs text-gray-500 dark:text-dark-400">还有 {{ items.length - 5 }} 项...</div>
    </div>
    <EmptyState v-else :title="`暂无待确认${typeLabel}`" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { EmptyState, Icon, SummaryTable } from '@/components/common'
import type { Column } from '@/components/common/types'

const props = defineProps({ items: { type: Array as any, default: () => [] }, type: { type: String, default: 'artwork' }, typeLabel: { type: String, default: '图稿' }, confirmingItem: { type: String as () => string | null, default: null } })
const emit = defineEmits(['confirm'])

const visibleItems = computed(() => props.items.slice(0, 5))

const columns: Column[] = [
  { key: 'code', label: '编码', class: 'max-w-xs truncate' },
  { key: 'name', label: '名称', class: 'max-w-xs truncate' },
  { key: 'actions', label: '操作', class: 'w-20' },
]
</script>
