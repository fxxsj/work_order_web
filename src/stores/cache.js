import { defineStore } from 'pinia'
import { ref } from 'vue'

const CACHE_TTL = 5 * 60 * 1000 // 5 分钟

export const useCacheStore = defineStore('cache', () => {
  // State
  const cache = ref({})

  // Helper functions
  function isExpired(timestamp) {
    return Date.now() - timestamp > CACHE_TTL
  }

  function setCacheItem(key, value) {
    cache.value[key] = {
      data: value,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
    }
  }

  function getCacheItem(key) {
    const item = cache.value[key]
    if (!item) return null
    if (isExpired(item.timestamp)) {
      delete cache.value[key]
      return null
    }
    return item.data
  }

  function hasValidCache(key) {
    return getCacheItem(key) !== null
  }

  // Actions
  function setCache(key, value, ttl = CACHE_TTL) {
    cache.value[key] = {
      data: value,
      timestamp: Date.now(),
      ttl,
    }
  }

  function getCache(key) {
    return getCacheItem(key)
  }

  function clearCache(key) {
    delete cache.value[key]
  }

  function clearAllCaches() {
    cache.value = {}
  }

  function setCustomerList(customers) {
    setCache('customerList', customers)
  }

  function getCustomerList() {
    return getCache('customerList')
  }

  function setProcessList(processes) {
    setCache('processList', processes)
  }

  function getProcessList() {
    return getCache('processList')
  }

  function setMaterialList(materials) {
    setCache('materialList', materials)
  }

  function getMaterialList() {
    return getCache('materialList')
  }

  function setUserList(users) {
    setCache('userList', users)
  }

  function getUserList() {
    return getCache('userList')
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
    getUserList,
  }
})
