/**
 * 通知管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class NotificationAPI extends BaseAPI {
  constructor() {
    super('/notifications/', request)
  }

  // 兼容旧调用名
  list(params?: Record<string, unknown>, config?: { signal?: AbortSignal }) {
    return this.getList(params, config)
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

  // 兼容旧调用名，实际后端动作仍是 mark_all_read
  markAllRead() {
    return this.markAllAsRead()
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

class SystemNotificationAPI extends BaseAPI {
  constructor() {
    super('/system-notifications/', request)
  }

  private requestWithFallback<T = unknown>(config: Record<string, unknown>): Promise<T> {
    return this.request(config as any).catch((error: any) => {
      if (error?.response?.status !== 404) throw error
      const url = String(config.url || '')
      return this.request({
        ...config,
        url: url.replace('/system-notifications/', '/notification-admin/')
      } as any)
    }) as Promise<T>
  }

  getList<T = unknown>(params?: Record<string, unknown>, config?: { signal?: AbortSignal }): Promise<T> {
    const requestConfig: Record<string, unknown> = {
      url: this.baseUrl,
      method: 'get',
      params
    }
    if (config?.signal) {
      requestConfig.signal = config.signal
    }
    return this.requestWithFallback(requestConfig).then(response => this._unwrap<T>(response))
  }

  createAnnouncement(data: Record<string, unknown>) {
    return this.requestWithFallback({
      url: `${this.baseUrl}create_announcement/`,
      method: 'post',
      data
    })
  }

  sendUrgentAlert(data: Record<string, unknown>) {
    return this.requestWithFallback({
      url: `${this.baseUrl}send_urgent_alert/`,
      method: 'post',
      data
    })
  }

  revoke(id: number | string) {
    return this.requestWithFallback({
      url: `${this.baseUrl}${id}/revoke/`,
      method: 'delete'
    })
  }
}

export const systemNotificationAPI = new SystemNotificationAPI()
