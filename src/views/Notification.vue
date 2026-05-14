<template>
  <el-card>
    <template #header><div class="card-header"><span>通知中心</span><div class="header-actions"><el-button v-if="unreadCount > 0" type="primary" size="small" :loading="markingAll" @click="markAllRead">标记全部已读</el-button><el-button size="small" :icon="Refresh" @click="loadData">刷新</el-button></div></div></template>
    <div class="table-scroll">
    <el-table v-loading="loading" :data="notificationList" class="notification-table" :row-class-name="getRowClassName">
      <el-table-column label="状态" width="80" align="center"><template #default="scope"><el-badge v-if="!scope.row.is_read" is-dot class="unread-badge" /><span v-else style="color: #909399;">已读</span></template></el-table-column>
      <el-table-column prop="notification_type_display" label="类型" width="120" />
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="content" label="内容" min-width="300" show-overflow-tooltip />
      <el-table-column label="时间" width="160"><template #default="scope">{{ formatDate(scope.row.created_at) }}</template></el-table-column>
      <el-table-column label="操作" width="150"><template #default="scope"><el-button type="text" size="small" @click="handleClick(scope.row)">查看</el-button><el-button v-if="!scope.row.is_read" type="text" size="small" @click="markRead(scope.row)">标记已读</el-button></template></el-table-column>
    </el-table>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'

defineProps({
  notificationList: { type: Array, default: () => [] },
  unreadCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  markingAll: { type: Boolean, default: false }
})

const emit = defineEmits(['mark-read', 'mark-all-read', 'click', 'refresh'])

const formatDate = (d) => d ? new Date(d).toLocaleString('zh-CN') : '-'
const getRowClassName = ({ row }) => row.is_read ? '' : 'unread-row'
const markRead = (row) => emit('mark-read', row)
const markAllRead = () => emit('mark-all-read')
const handleClick = (row) => emit('click', row)
const loadData = () => emit('refresh')
</script>

<style lang="scss" scoped>
@use '@/assets/styles/tokens/breakpoints' as bp;

.card-header { display: flex; justify-content: space-between; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.header-actions { display: flex; align-items: center; gap: var(--ui-control-gap); flex-wrap: wrap; }
.table-scroll { margin-top: var(--ui-section-gap); overflow-x: auto; }
.notification-table { width: 100%; }
:deep(.unread-row) { background-color: #f0f9ff; }

@media (max-width: bp.$breakpoint-phone-max) {
  .card-header,
  .header-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions .el-button {
    width: 100%;
  }
}
</style>
