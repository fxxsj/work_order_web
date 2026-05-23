<template>
  <div class="dispatch-preview">
    <Alert
      v-if="!globalDispatchEnabled"
      type="warning"
      title="自动分派已禁用"
      description="预览显示的是配置效果，但任务不会实际分派"
      :closable="false"
      style="margin-bottom: 16px;"
    />

    <div class="table-scroll overflow-x-auto">
      <table class="data-table w-full">
        <thead>
          <tr>
            <th class="w-10"></th>
            <th class="text-left">工序</th>
            <th class="text-left">目标部门</th>
            <th class="text-left">目标操作员</th>
            <th class="text-left">预计等待时间</th>
            <th class="text-left">当前负载</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(row, idx) in previewData" :key="idx">
            <tr class="cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700" @click="toggleExpand(idx)">
              <td class="text-center">
                <Icon :name="expandedRows.has(idx) ? 'chevronDown' : 'chevronRight'" class="h-4 w-4 text-gray-400" />
              </td>
              <td>{{ row.process_name }}</td>
              <td>
                <Tag :type="row.target_department_id ? 'success' : 'info'">
                  {{ row.target_department_name || '未配置' }}
                </Tag>
              </td>
              <td>{{ row.target_operator_name || '-' }}</td>
              <td>
                <span :class="getWaitTimeClass(row.estimated_wait_time)">
                  {{ row.estimated_wait_time || '-' }}
                </span>
              </td>
              <td>
                <ProgressBar :percentage="row.current_load || 0" :status="getLoadStatus(row.current_load)" />
              </td>
            </tr>
            <tr v-if="expandedRows.has(idx)">
              <td colspan="6" class="bg-gray-50 dark:bg-dark-800 px-8 py-4">
                <div v-if="row.all_departments && row.all_departments.length > 0">
                  <div class="expand-header">
                    <span class="text-sm font-medium">所有配置部门 ({{ row.all_departments.length }})</span>
                    <Tag size="small" type="info">按优先级排序</Tag>
                  </div>
                  <table class="data-table w-full mt-2">
                    <thead>
                      <tr>
                        <th class="text-left">部门</th>
                        <th class="text-left">优先级</th>
                        <th class="text-left">当前负载</th>
                        <th class="text-left">预计等待</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="dept in row.all_departments" :key="dept.department_id">
                        <td>
                          <div class="flex items-center gap-2">
                            <span>{{ dept.department_name }}</span>
                            <Tag v-if="dept.department_id === row.target_department_id" size="small" type="success">当前选择</Tag>
                          </div>
                        </td>
                        <td>{{ dept.priority }}</td>
                        <td><ProgressBar :percentage="dept.current_load || 0" :status="getLoadStatus(dept.current_load)" /></td>
                        <td>{{ dept.estimated_wait_time || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <EmptyState v-else title="暂无部门配置" />
              </td>
            </tr>
          </template>
          <tr v-if="loading">
            <td colspan="6" class="py-8 text-center text-gray-400">
              <div class="space-y-3">
                <div v-for="i in 3" :key="i" class="h-6 animate-pulse rounded bg-gray-200 dark:bg-dark-600" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  previewData: { type: Array as any, default: () => [] },
  loading: { type: Boolean, default: false },
  globalDispatchEnabled: { type: Boolean, default: true }
})

const expandedRows = ref(new Set())

const toggleExpand = (idx: any) => {
  if (expandedRows.value.has(idx)) expandedRows.value.delete(idx)
  else expandedRows.value.add(idx)
}

const getWaitTimeClass = (waitTime: any) => {
  if (!waitTime) return ''
  const hours = parseFloat(waitTime)
  if (hours < 1) return 'wait-time-short'
  if (hours < 4) return 'wait-time-medium'
  return 'wait-time-long'
}

const getLoadStatus = (load: any) => {
  if (!load) return ''
  if (load < 50) return 'success'
  if (load < 80) return 'warning'
  return 'exception'
}
</script>

<style>
.dispatch-preview {
  padding: 20px;
}

.expand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.wait-time-short {
  color: #67c23a;
}

.wait-time-medium {
  color: #e6a23c;
}

.wait-time-long {
  color: #f56c6c;
}
</style>
