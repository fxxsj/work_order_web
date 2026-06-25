/**
 * 模块级审核开关配置 Store
 *
 * 提供全局可复用的审核开关状态，默认全部开启（避免配置未加载时误判）。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { approvalConfigAPI, type ApprovalConfig } from '@/api/modules/approval-config'

const MODULE_KEY_MAP: Record<string, keyof ApprovalConfig> = {
  workorder: 'workorder_approval_enabled',
  salesorder: 'salesorder_approval_enabled',
  purchaseorder: 'purchaseorder_approval_enabled',
  invoice: 'invoice_approval_enabled',
  supplierpayment: 'supplierpayment_approval_enabled',
  stockin: 'stockin_approval_enabled',
  stockout: 'stockout_approval_enabled'
}

const DEFAULT_CONFIG: ApprovalConfig = {
  workorder_approval_enabled: true,
  salesorder_approval_enabled: true,
  purchaseorder_approval_enabled: true,
  invoice_approval_enabled: true,
  supplierpayment_approval_enabled: true,
  stockin_approval_enabled: true,
  stockout_approval_enabled: true
}

export const useApprovalConfigStore = defineStore('approvalConfig', () => {
  // ==================== State ====================
  const config = ref<ApprovalConfig>({ ...DEFAULT_CONFIG })
  const loading = ref(false)
  const loaded = ref(false)

  // ==================== Getters ====================
  const isEnabled = computed(() => (moduleName: string): boolean => {
    const key = MODULE_KEY_MAP[moduleName]
    if (!key) return true
    return (config.value[key] as boolean) ?? true
  })

  // ==================== Actions ====================
  async function load(force = false) {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const res: any = await approvalConfigAPI.get()
      const data = res.data ?? res
      config.value = { ...DEFAULT_CONFIG, ...data }
      loaded.value = true
    } catch (error) {
      // 加载失败时保持默认开启，避免阻断业务操作
      console.error('Failed to load approval config:', error)
    } finally {
      loading.value = false
    }
  }

  function $reset() {
    config.value = { ...DEFAULT_CONFIG }
    loading.value = false
    loaded.value = false
  }

  return {
    config,
    loading,
    loaded,
    isEnabled,
    load,
    $reset
  }
})
