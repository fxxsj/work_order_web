<template>
  <div>
    <EmptyState
      v-if="!items || items.length === 0"
      :title="emptyText"
    />
    <template v-if="!items || items.length === 0">
      <button
        v-if="!disabled"
        class="btn btn-primary btn-sm mt-3"
        @click="handleAdd"
      >
        <Icon
          name="plus"
          class="h-3 w-3"
        /> {{ addButtonText }}
      </button>
    </template>
    <div v-else>
      <div class="mb-3 flex items-center justify-between">
        <span class="font-bold">{{ title }}（{{ items.length }}）</span><button
          v-if="!disabled"
          class="btn btn-primary btn-sm"
          @click="handleAdd"
        >
          <Icon
            name="plus"
            class="h-3 w-3"
          /> 添加
        </button>
      </div>
      <LineItemsTable
        :columns="columns"
        :items="items"
        :show-delete="!disabled"
        @delete="handleRemove"
      >
        <template #cell-confirmed="{ row }">
          <Tag
            :type="row.confirmed ? 'success' : 'warning'"
            size="small"
          >
            {{ row.confirmed ? '已确认' : '待确认' }}
          </Tag>
        </template>
      </LineItemsTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon, Tag, EmptyState, LineItemsTable } from '@/components/common'
import type { Column } from '@/components/common/types'

defineProps({
  items: { type: Array as any, default: () => [] },
  title: { type: String, default: '列表' },
  nameLabel: { type: String, default: '名称' },
  emptyText: { type: String, default: '暂无数据' },
  addButtonText: { type: String, default: '添加' },
  disabled: { type: Boolean, default: false }
})

const emit = defineEmits(['add', 'remove'])

const columns: Column[] = [
  { key: 'name', label: '名称' },
  { key: 'version', label: '版本', width: 80, align: 'center' },
  { key: 'confirmed', label: '确认状态', width: 96, align: 'center' },
  { key: 'notes', label: '备注' },
]

const handleAdd = () => emit('add')
const handleRemove = (index: number) => emit('remove', index)
</script>
