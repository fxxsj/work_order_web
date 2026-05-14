<template>
  <div class="task-filters">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="5"><el-select :model-value="selectedDepartment" placeholder="选择部门" clearable filterable style="width: 100%;" @update:model-value="v => emit('department-change', v)"><el-option v-for="d in departments" :key="d.id" :label="d.name" :value="d.id" /></el-select></el-col>
      <el-col :xs="24" :sm="12" :md="4"><el-select :model-value="selectedStatus" placeholder="任务状态" clearable style="width: 100%;" @update:model-value="v => emit('status-change', v)"><el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" /></el-option></el-select></el-col>
      <el-col :xs="24" :sm="12" :md="4"><el-select :model-value="selectedTaskType" placeholder="任务类型" clearable style="width: 100%;" @update:model-value="v => emit('task-type-change', v)"><el-option v-for="t in taskTypeOptions" :key="t.value" :label="t.label" :value="t.value" /></el-option></el-select></el-col>
      <el-col :xs="24" :sm="12" :md="5"><el-input :model-value="searchText" placeholder="搜索任务内容，施工单号" clearable @update:model-value="v => emit('search-input', v)" @keyup.enter="emit('search')"><template #append><el-button :icon="Search" @click="emit('search')" /></template></el-input></el-col>
      <el-col :xs="24" :sm="24" :md="6" class="task-filter-actions">
        <el-button :icon="RefreshLeft" @click="emit('reset')">重置</el-button>
        <el-button :loading="loading" :icon="Refresh" @click="emit('refresh')">刷新</el-button>
        <el-button type="primary" :icon="View" @click="emit('view-toggle')">{{ isListView ? '看板视图' : '列表视图' }}</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Search, RefreshLeft, Refresh, View } from '@element-plus/icons-vue'

defineProps({ departments: { type: Array, default: () => [] }, selectedDepartment: { type: [Number, null], default: null }, selectedStatus: { type: String, default: '' }, selectedTaskType: { type: String, default: '' }, searchText: { type: String, default: '' }, isListView: { type: Boolean, default: false }, loading: { type: Boolean, default: false } })
const emit = defineEmits(['department-change', 'status-change', 'task-type-change', 'search-input', 'search', 'clear', 'reset', 'refresh', 'view-toggle'])

const statusOptions = [{ value: 'pending', label: '待开始' }, { value: 'in_progress', label: '进行中' }, { value: 'completed', label: '已完成' }, { value: 'cancelled', label: '已取消' }]
const taskTypeOptions = [{ value: 'general', label: '通用任务' }, { value: 'plate_making', label: '制版任务' }, { value: 'cutting', label: '开料任务' }, { value: 'printing', label: '印刷任务' }, { value: 'foiling', label: '烫金任务' }, { value: 'embossing', label: '压凸任务' }, { value: 'die_cutting', label: '模切任务' }, { value: 'packaging', label: '包装任务' }]
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.task-filters {
  padding: var(--ui-control-gap) 0;
  margin-bottom: var(--ui-section-gap);
}

.task-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ui-control-gap);
}

@media (max-width: bp.$breakpoint-phone-max) {
  .task-filter-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
