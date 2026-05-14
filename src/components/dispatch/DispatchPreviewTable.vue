<template>
  <div class="dispatch-preview">
    <el-alert
      v-if="!globalDispatchEnabled"
      type="warning"
      title="自动分派已禁用"
      description="预览显示的是配置效果，但任务不会实际分派"
      :closable="false"
      style="margin-bottom: 16px;"
    />

    <el-table
      v-loading="loading"
      :data="previewData"
      border
      stripe
      style="width: 100%;"
    >
      <el-table-column type="expand">
        <template #default="scope">
          <div v-if="scope.row.all_departments && scope.row.all_departments.length > 0" class="expand-content">
            <div class="expand-header">
              <span>所有配置部门 ({{ scope.row.all_departments.length }})</span>
              <el-tag size="small" type="info">
                按优先级排序
              </el-tag>
            </div>
            <el-table
              :data="scope.row.all_departments"
              size="small"
              :show-header="true"
              style="margin: 0 16px 16px 16px;"
            >
              <el-table-column prop="department_name" label="部门" width="180">
                <template #default="deptScope">
                  <div style="display: flex; align-items: center;">
                    <span>{{ deptScope.row.department_name }}</span>
                    <el-tag
                      v-if="deptScope.row.department_id === scope.row.target_department_id"
                      size="small"
                      type="success"
                      style="margin-left: 8px;"
                    >
                      当前选择
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="priority" label="优先级" width="100" />
              <el-table-column prop="current_load" label="当前负载" width="120">
                <template #default="deptScope">
                  <el-progress :percentage="deptScope.row.current_load || 0" :status="getLoadStatus(deptScope.row.current_load)" />
                </template>
              </el-table-column>
              <el-table-column prop="estimated_wait_time" label="预计等待" width="120">
                <template #default="deptScope">
                  {{ deptScope.row.estimated_wait_time || '-' }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="暂无部门配置" />
        </template>
      </el-table-column>

      <el-table-column prop="process_name" label="工序" min-width="150" />
      <el-table-column prop="target_department_name" label="目标部门" min-width="150">
        <template #default="scope">
          <el-tag :type="scope.row.target_department_id ? 'success' : 'info'">
            {{ scope.row.target_department_name || '未配置' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="target_operator_name" label="目标操作员" min-width="150">
        <template #default="scope">
          {{ scope.row.target_operator_name || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="estimated_wait_time" label="预计等待时间" width="150">
        <template #default="scope">
          <span :class="getWaitTimeClass(scope.row.estimated_wait_time)">
            {{ scope.row.estimated_wait_time || '-' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="current_load" label="当前负载" width="150">
        <template #default="scope">
          <el-progress :percentage="scope.row.current_load || 0" :status="getLoadStatus(scope.row.current_load)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
const props = defineProps({
  previewData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  globalDispatchEnabled: {
    type: Boolean,
    default: true
  }
})

const getWaitTimeClass = (waitTime) => {
  if (!waitTime) return ''
  const hours = parseFloat(waitTime)
  if (hours < 1) return 'wait-time-short'
  if (hours < 4) return 'wait-time-medium'
  return 'wait-time-long'
}

const getLoadStatus = (load) => {
  if (!load) return ''
  if (load < 50) return 'success'
  if (load < 80) return 'warning'
  return 'exception'
}
</script>

<style scoped>
.dispatch-preview {
  padding: 20px;
}

.expand-content {
  padding: 16px;
}

.expand-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 16px;
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
