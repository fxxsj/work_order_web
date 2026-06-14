/**
 * 缓存 Store
 * 管理 API 数据缓存（客户列表、工序列表、物料列表、用户列表）
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export const useCacheStore = defineStore('cache', () => {
  // ==================== State ====================

  const cache = ref<Record<string, CacheItem<unknown>>>({})

  // ==================== Helpers ====================

  function isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_TTL
  }

  function getCacheItem<T>(key: string): T | null {
    const item = cache.value[key] as CacheItem<T> | undefined
    if (!item) return null
    if (isExpired(item.timestamp)) {
      delete cache.value[key]
      return null
    }
    return item.data
  }

  // ==================== Actions ====================

  function setCache<T>(key: string, value: T, ttl = CACHE_TTL): void {
    cache.value[key] = {
      data: value,
      timestamp: Date.now(),
      ttl
    }
  }

  function getCache<T>(key: string): T | null {
    return getCacheItem<T>(key)
  }

  function clearCache(key: string): void {
    delete cache.value[key]
  }

  function clearAllCaches(): void {
    cache.value = {}
  }

  // ==================== 业务缓存快捷方法 ====================

  function setCustomerList<T>(customers: T): void {
    setCache('customerList', customers)
  }

  function getCustomerList<T>(): T | null {
    return getCache<T>('customerList')
  }

  function setProcessList<T>(processes: T): void {
    setCache('processList', processes)
  }

  function getProcessList<T>(): T | null {
    return getCache<T>('processList')
  }

  function setMaterialList<T>(materials: T): void {
    setCache('materialList', materials)
  }

  function getMaterialList<T>(): T | null {
    return getCache<T>('materialList')
  }

  function setUserList<T>(users: T): void {
    setCache('userList', users)
  }

  function getUserList<T>(): T | null {
    return getCache<T>('userList')
  }

  return {
    cache,
    setCache,
    getCache,
    clearCache,
    clearAllCaches,
    setCustomerList,
    getCustomerList,
    setProcessList,
    getProcessList,
    setMaterialList,
    getMaterialList,
    setUserList,
    getUserList
  }
})
