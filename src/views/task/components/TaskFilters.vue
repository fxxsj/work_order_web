<template>
  <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
    <Select :model-value="selectedDepartment" :options="departmentOptions" placeholder="选择部门" clearable filterable class="w-full" @update:model-value="v => emit('department-change', v)" />
    <Select :model-value="selectedStatus" :options="statusOptions" placeholder="任务状态" clearable class="w-full" @update:model-value="v => emit('status-change', v)" />
    <Select :model-value="selectedTaskType" :options="taskTypeOptions" placeholder="任务类型" clearable class="w-full" @update:model-value="v => emit('task-type-change', v)" />
    <SearchInput :model-value="searchText" placeholder="搜索任务内容，施工单号" @update:model-value="v => emit('search-input', v)" @search="emit('search')" />
    <div class="flex flex-wrap items-center gap-2 md:col-span-5 md:justify-end">
      <button class="btn btn-secondary btn-sm" @click="emit('reset')"><Icon name="refresh" class="h-3 w-3" /> 重置</button>
      <button class="btn btn-secondary btn-sm" :disabled="loading" @click="emit('refresh')"><Icon name="refresh" class="h-3 w-3" /> 刷新</button>
      <button class="btn btn-primary btn-sm" @click="emit('view-toggle')"><Icon name="eye" class="h-3 w-3" /> {{ isListView ? '看板视图' : '列表视图' }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { SearchInput, Select, Icon } from '@/components/common'

const props = defineProps({ departments: { type: Array as any, default: () => [] }, selectedDepartment: { type: [Number, null], default: null }, selectedStatus: { type: String, default: '' }, selectedTaskType: { type: String, default: '' }, searchText: { type: String, default: '' }, isListView: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['department-change', 'status-change', 'task-type-change', 'search-input', 'search', 'clear', 'reset', 'refresh', 'view-toggle'])

const departmentOptions = computed(() => props.departments.map((d: any) => ({ value: d.id, label: d.name })))
const statusOptions = [{ value: 'pending', label: '待开始' }, { value: 'in_progress', label: '进行中' }, { value: 'completed', label: '已完成' }, { value: 'cancelled', label: '已取消' }]
const taskTypeOptions = [{ value: 'general', label: '通用任务' }, { value: 'plate_making', label: '制版任务' }, { value: 'cutting', label: '开料任务' }, { value: 'printing', label: '印刷任务' }, { value: 'foiling', label: '烫金任务' }, { value: 'embossing', label: '压凸任务' }, { value: 'die_cutting', label: '模切任务' }, { value: 'packaging', label: '包装任务' }]
</script>