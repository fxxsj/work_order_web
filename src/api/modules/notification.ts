/**
 * 通知管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class NotificationAPI extends BaseAPI {
  constructor() {
    super('/notifications/', request)
  }

  // 标记单个通知为已读
  markAsRead(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/mark_read/`,
      method: 'post'
    })
  }

  // 标记所有通知为已读
  markAllAsRead() {
    return this.request({
      url: `${this.baseUrl}mark_all_read/`,
      method: 'post'
    })
  }

  // 获取未读数量
  getUnreadCount() {
    return this.request({
      url: `${this.baseUrl}unread_count/`,
      method: 'get'
    })
  }

  // 获取通知统计
  getStatistics() {
    return this.request({
      url: `${this.baseUrl}statistics/`,
      method: 'get'
    })
  }

  // 删除通知（使用自定义路由而非标准 DELETE，避免与父类泛型签名冲突）
  deleteNotification(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/delete/`,
      method: 'delete'
    })
  }

  // 删除所有已读
  deleteAllRead() {
    return this.request({
      url: `${this.baseUrl}delete_all_read/`,
      method: 'delete'
    })
  }
}

export const notificationAPI = new NotificationAPI()
export default notificationAPI
