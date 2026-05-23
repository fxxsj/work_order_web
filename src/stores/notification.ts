/**
 * 通知 Store
 * 管理应用内通知列表和未读计数
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/types'

export const useNotificationStore = defineStore('notification', () => {
  // ==================== State ====================

  const notifications = ref<(Notification & { read: boolean; timestamp: number })[]>([])
  const unreadCount = ref(0)

  // ==================== Actions ====================

  function addNotification(notification: Partial<Notification>): void {
    notifications.value.unshift({
      id: Date.now(),
      title: notification.title || '',
      content: notification.content,
      type: notification.type || 'info',
      is_read: false,
      timestamp: Date.now(),
      ...notification
    } as Notification & { read: boolean; timestamp: number })
    unreadCount.value++
  }

  function markAsRead(notificationId: number): void {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  function markAllAsRead(): void {
    notifications.value.forEach(n => { n.read = true })
    unreadCount.value = 0
  }

  function clearNotifications(): void {
    notifications.value = []
    unreadCount.value = 0
  }

  function removeNotification(notificationId: number): void {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      if (!notifications.value[index].read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    removeNotification
  }
})
