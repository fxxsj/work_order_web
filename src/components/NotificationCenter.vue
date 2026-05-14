<template>
  <div class="notification-center">
    <!-- 铃铛图标 -->
    <el-badge
      :value="unreadCountDisplay"
      :hidden="!hasUnread"
      class="notification-badge"
    >
      <el-button
        class="notification-bell"
        :class="{ 'has-error': connectionError }"
        circle
        :icon="Bell"
        @click="toggleDropdown"
      >
        <el-icon v-if="connectionError" class="connection-error-icon"><Warning /></el-icon>
      </el-button>
    </el-badge>

    <!-- 下拉面板 -->
    <el-popover
      ref="popover"
      v-model:visible="dropdownVisible"
      placement="bottom-end"
      width="380"
      trigger="manual"
      popper-class="notification-popover"
    >
      <div v-loading="loading" class="notification-panel">
        <!-- 头部 -->
        <div class="notification-header">
          <span class="notification-title">通知</span>
          <div class="notification-actions">
            <el-button
              v-if="hasUnread"
              type="text"
              size="small"
              @click="markAllAsRead"
            >
              全部已读
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="goToNotificationPage"
            >
              查看全部
            </el-button>
          </div>
        </div>

        <!-- 通知列表 -->
        <div class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ unread: !notification.is_read }"
            @click="handleClick(notification)"
          >
            <div class="notification-icon">
              <el-icon :size="20">
                <component :is="getNotificationIcon(notification.type)" />
              </el-icon>
            </div>
            <div class="notification-content">
              <div class="notification-title-text">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
            </div>
            <div v-if="!notification.is_read" class="notification-unread-dot"></div>
          </div>
          
          <el-empty v-if="notifications.length === 0" description="暂无通知" />
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell, Warning, InfoFilled, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  connectionError: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['mark-all-read', 'click'])

const router = useRouter()
const dropdownVisible = ref(false)

const unreadCount = computed(() => {
  return props.notifications.filter(n => !n.is_read).length
})

const unreadCountDisplay = computed(() => {
  return unreadCount.value > 99 ? '99+' : unreadCount.value
})

const hasUnread = computed(() => unreadCount.value > 0)

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
}

const markAllAsRead = () => {
  emit('mark-all-read')
}

const goToNotificationPage = () => {
  dropdownVisible.value = false
  router.push('/notifications')
}

const handleClick = (notification) => {
  emit('click', notification)
  dropdownVisible.value = false
}

const getNotificationIcon = (type) => {
  const iconMap = {
    info: InfoFilled,
    success: SuccessFilled,
    warning: Warning,
    error: CircleCloseFilled
  }
  return iconMap[type] || InfoFilled
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}
</script>

<style scoped>
.notification-center {
  position: relative;
}

.notification-badge {
  cursor: pointer;
}

.notification-bell {
  font-size: 20px;
}

.notification-bell.has-error {
  color: #f56c6c;
}

.connection-error-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  color: #f56c6c;
}

.notification-panel {
  max-height: 400px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.notification-title {
  font-weight: bold;
  font-size: 16px;
}

.notification-actions {
  display: flex;
  gap: 10px;
}

.notification-list {
  padding: 10px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #ecf5ff;
}

.notification-icon {
  margin-right: 10px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title-text {
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 12px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.notification-unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
  margin-left: 10px;
  flex-shrink: 0;
}
</style>
