<template>
  <div class="virtual-task-list">
    <VirtualList
      :items="tasks"
      :item-size="60"
      :height="listHeight"
      :has-more="hasMore"
      :loading="loading"
      :show-pagination="showPagination"
      :page="currentPage"
      :page-size="pageSize"
      :total="total"
      @row-click="handleTaskClick"
      @load-more="handleLoadMore"
      @page-change="handlePageChange"
      @update:page-size="handleSizeChange"
    >
      <!-- 表头列定义 -->
      <template #columns>
        <th style="width:80px">ID</th>
        <th style="width:150px">施工单号</th>
        <th style="width:120px">工序</th>
        <th style="min-width:200px">任务内容</th>
        <th style="width:120px">分派部门</th>
        <th style="width:100px">状态</th>
        <th style="width:80px">优先级</th>
        <th style="width:200px">操作</th>
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
          <div class="task-cell task-cell-id">
            #{{ item.id }}
          </div>

          <!-- 施工单号 -->
          <div class="task-cell task-cell-order">
            <a
              v-if="item.work_order_process_info?.work_order?.id"
              href="#"
              class="text-primary-600 hover:text-primary-700 dark:text-primary-400 cursor-pointer"
              @click.prevent.stop="goToWorkOrder(item.work_order_process_info.work_order)"
            >
              {{ item.work_order_process_info.work_order.order_number }}
            </a>
            <span v-else>-</span>
          </div>

          <!-- 工序 -->
          <div class="task-cell task-cell-process">
            {{ item.work_order_process_info?.process?.name || '-' }}
          </div>

          <!-- 任务内容 -->
          <div class="task-cell task-cell-content">
            {{ item.work_content }}
          </div>

          <!-- 分派部门 -->
          <div class="task-cell task-cell-department">
            {{ item.assigned_department_name || '-' }}
          </div>

          <!-- 状态 -->
          <div class="task-cell task-cell-status">
            <StatusTag :status="item.status" category="task" :label="item.status_display" size="small" />
          </div>

          <!-- 优先级 -->
          <div class="task-cell task-cell-priority">
            <StatusTag :status="item.priority" category="priority" :label="item.priority_display" size="small" />
          </div>

          <!-- 操作 -->
          <div class="task-cell task-cell-actions">
            <button class="btn btn-ghost btn-sm" v-if="item.status === 'pending'" @click.stop="handleAssign(item)">
              分派
            </button>
            <button class="btn btn-ghost btn-sm" v-if="item.status === 'in_progress'" @click.stop="handleUpdate(item)">
              更新
            </button>
            <button class="btn btn-ghost btn-sm" v-if="item.status !== 'completed'" @click.stop="handleComplete(item)">
              完成
            </button>
          </div>
        </div>
      </template>
    </VirtualList>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { StatusTag } from '@/components/common'
import VirtualList from './VirtualList.vue'

const props = defineProps({
  tasks: { type: Array as any, default: () => [] },
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

const goToWorkOrder = (workOrder: any) => {
  if (workOrder?.id) {
    router.push(`/workorders/${workOrder.id}`)
  }
}

const handleTaskClick = (item: any) => {
  emit('task-click', item)
}

const handleLoadMore = () => {
  emit('load-more')
}

const handlePageChange = (page: any) => {
  emit('page-change', page)
}

const handleSizeChange = (size: any) => {
  emit('size-change', size)
}

const handleAssign = (item: any) => {
  emit('assign', item)
}

const handleUpdate = (item: any) => {
  emit('update', item)
}

const handleComplete = (item: any) => {
  emit('complete', item)
}

</script>

<style lang="scss">
@use '@/assets/styles/tokens/breakpoints' as bp;

.virtual-task-list {
  width: 100%;
  overflow-x: auto;
}

.task-item {
  display: flex;
  align-items: center;
  width: max-content;
  min-width: 100%;
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
  padding: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-cell-id,
.task-cell-priority { flex: 0 0 8ch; }
.task-cell-order { flex: 0 0 16ch; }
.task-cell-process,
.task-cell-department { flex: 0 0 12ch; }
.task-cell-status { flex: 0 0 10ch; }

.task-cell-content {
  flex: 1 0 24ch;
}

.task-cell-actions {
  flex: 0 0 20ch;
}
</style>
