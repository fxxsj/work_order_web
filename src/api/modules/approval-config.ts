/**
 * 模块级审核开关配置 API
 *
 * 对应后端 GET/PUT /api/v1/approval-config/
 */
import request from '@/api/index'

export interface ApprovalConfig {
  workorder_approval_enabled: boolean
  salesorder_approval_enabled: boolean
  purchaseorder_approval_enabled: boolean
  invoice_approval_enabled: boolean
  supplierpayment_approval_enabled: boolean
  stockin_approval_enabled: boolean
  stockout_approval_enabled: boolean
  updated_at?: string
}

const approvalConfigAPI = {
  get() {
    return request({ url: '/approval-config/', method: 'get' })
  },
  update(data: Partial<ApprovalConfig>) {
    return request({ url: '/approval-config/', method: 'put', data })
  }
}

export { approvalConfigAPI }
export default approvalConfigAPI
