<template>
  <div class="virtual-task-list">
    <VirtualList
      :items="tasks"
      :item-size="60"
      :height="listHeight"
      :has-more="hasMore"
      :loading="loading"
      :show-pagination="showPagination"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @row-click="handleTaskClick"
      @load-more="handleLoadMore"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <!-- 表头列定义 -->
      <template #columns>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="施工单号" width="150" />
        <el-table-column label="工序" width="120" />
        <el-table-column prop="work_content" label="任务内容" min-width="200" />
        <el-table-column label="分派部门" width="120" />
        <el-table-column label="状态" width="100" />
        <el-table-column label="优先级" width="80" />
        <el-table-column label="操作" width="200" fixed="right" />
      </template>

      <!-- 列表项模板 -->
      <template #item="{ item }">
        <div
          class="task-item"
          :class="{
            'task-item-pending': item.status === 'pending',
            'task-item-progress': item.status === 'in_progress',
            'task-item-completed': item.status === 'completed'
          }"
        >
          <!-- ID -->
          <div class="task-cell" style="width: 80px; padding: 0 8px;">
            #{{ item.id }}
          </div>

          <!-- 施工单号 -->
          <div class="task-cell" style="width: 150px; padding: 0 8px;">
            <el-link
              v-if="item.work_order_process_info?.work_order?.id"
              type="primary"
              @click.stop="goToWorkOrder(item.work_order_process_info.work_order)"
            >
              {{ item.work_order_process_info.work_order.order_number }}
            </el-link>
            <span v-else>-</span>
          </div>

          <!-- 工序 -->
          <div class="task-cell" style="width: 120px; padding: 0 8px;">
            {{ item.work_order_process_info?.process?.name || '-' }}
          </div>

          <!-- 任务内容 -->
          <div class="task-cell" style="flex: 1; min-width: 200px; padding: 0 8px;">
            {{ item.work_content }}
          </div>

          <!-- 分派部门 -->
          <div class="task-cell" style="width: 120px; padding: 0 8px;">
            {{ item.assigned_department_name || '-' }}
          </div>

          <!-- 状态 -->
          <div class="task-cell" style="width: 100px; padding: 0 8px;">
            <el-tag :type="getStatusType(item.status)" size="small">
              {{ item.status_display }}
            </el-tag>
          </div>

          <!-- 优先级 -->
          <div class="task-cell" style="width: 80px; padding: 0 8px;">
            <el-tag :type="getPriorityType(item.priority)" size="small">
              {{ item.priority_display }}
            </el-tag>
          </div>

          <!-- 操作 -->
          <div class="task-cell" style="width: 200px; padding: 0 8px;">
            <el-button
              v-if="item.status === 'pending'"
              type="text"
              size="small"
              @click.stop="handleAssign(item)"
            >
              分派
            </el-button>
            <el-button
              v-if="item.status === 'in_progress'"
              type="text"
              size="small"
              @click.stop="handleUpdate(item)"
            >
              更新
            </el-button>
            <el-button
              v-if="item.status !== 'completed'"
              type="text"
              size="small"
              @click.stop="handleComplete(item)"
            >
              完成
            </el-button>
          </div>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import VirtualList from './VirtualList.vue'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  listHeight: { type: Number, default: 400 },
  hasMore: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showPagination: { type: Boolean, default: true },
  currentPage: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  total: { type: Number, default: 0 }
})

const emit = defineEmits([
  'task-click',
  'load-more',
  'page-change',
  'size-change',
  'assign',
  'update',
  'complete'
])

const router = useRouter()

const goToWorkOrder = (workOrder) => {
  if (workOrder?.id) {
    router.push(`/workorders/${workOrder.id}`)
  }
}

const handleTaskClick = (item) => {
  emit('task-click', item)
}

const handleLoadMore = () => {
  emit('load-more')
}

const handlePageChange = (page) => {
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  emit('size-change', size)
}

const handleAssign = (item) => {
  emit('assign', item)
}

const handleUpdate = (item) => {
  emit('update', item)
}

const handleComplete = (item) => {
  emit('complete', item)
}

const getStatusType = (status) => {
  const typeMap = {
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getPriorityType = (priority) => {
  const typeMap = {
    low: 'info',
    normal: 'success',
    high: 'warning',
    urgent: 'danger'
  }
  return typeMap[priority] || 'info'
}
</script>

<style scoped>
.virtual-task-list {
  width: 100%;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.2s;
}

.task-item:hover {
  background-color: #f5f7fa;
}

.task-item-pending {
  border-left: 3px solid #e6a23c;
}

.task-item-progress {
  border-left: 3px solid #409eff;
}

.task-item-completed {
  border-left: 3px solid #67c23a;
}

.task-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
