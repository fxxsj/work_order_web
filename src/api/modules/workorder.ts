/**
 * 施工单管理 API
 * 复杂模块：包含 CRUD + 审批、状态更改、统计等自定义操作
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class WorkOrderAPI extends BaseAPI {
  constructor() {
    super('/workorders/', request)
  }

  // 添加工序到施工单
  addProcess(id: number | string, data: unknown) {
    return this.customAction(`${this.baseUrl}${id}/add_process/`, 'post', data)
  }

  // 添加物料到施工单
  addMaterial(id: number | string, data: unknown) {
    return this.customAction(`${this.baseUrl}${id}/add_material/`, 'post', data)
  }

  // 业务员审核施工单
  approve(id: number | string, data?: unknown) {
    return this.customAction(`/workorders-flow/${id}/approve/`, 'post', data)
  }

  // 重新提交审核（审核拒绝后使用）
  resubmitForApproval(id: number | string) {
    return this.customAction(`${this.baseUrl}${id}/resubmit_for_approval/`, 'post')
  }

  // 请求重新审核（审核通过后发现错误需要修改）
  requestReapproval(id: number | string, data: unknown) {
    return this.customAction(`${this.baseUrl}${id}/request_reapproval/`, 'post', data)
  }

  // 更新状态
  updateStatus(id: number | string, status: unknown) {
    const payload = typeof status === 'object' && status !== null && 'status' in status
      ? status
      : { status }
    return this.customAction(`${this.baseUrl}${id}/update_status/`, 'post', payload)
  }

  // 获取统计数据
  getStatistics(params?: Record<string, unknown>) {
    return this.customAction(`${this.baseUrl}statistics/`, 'get', null, params)
  }

  // 获取施工单汇总
  getSummary(params?: Record<string, unknown>) {
    return this.customAction(`${this.baseUrl}summary/`, 'get', null, params)
  }

  // 获取可关联的客户订单候选
  getSalesOrderCandidates(params?: Record<string, unknown>) {
    return this.customAction(`${this.baseUrl}sales_order_candidates/`, 'get', null, params)
  }

  // 导出施工单列表
  export(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}export/`,
      method: 'get',
      params,
      responseType: 'blob'
    })
  }

  // 提交审批
  submitApproval(id: number | string, data: unknown) {
    return this.customAction(`/workorders-flow/${id}/submit_approval/`, 'post', data)
  }

  // 拒绝施工单
  reject(id: number | string, data?: unknown) {
    return this.customAction(`/workorders-flow/${id}/reject/`, 'post', data)
  }

  // 检查完成状态
  checkCompletion(id: number | string) {
    return this.customAction(`/workorders-flow/${id}/check_completion/`, 'post')
  }

  // 标记紧急
  markUrgent(id: number | string, data: unknown) {
    return this.customAction(`/workorders-flow/${id}/mark_urgent/`, 'post', data)
  }

  // 检查是否需要同步任务
  checkSyncNeeded(id: number | string, processIds: (number | string)[]) {
    const params = processIds && processIds.length > 0
      ? { process_ids: processIds.join(',') }
      : {}
    return this.customAction(`${this.baseUrl}${id}/check_sync_needed/`, 'get', null, params)
  }

  // 预览任务同步变更
  syncTasksPreview(id: number | string, processIds: (number | string)[]) {
    return this.customAction(`${this.baseUrl}${id}/sync_tasks_preview/`, 'post', {
      process_ids: processIds
    })
  }

  // 执行任务同步
  syncTasksExecute(id: number | string, processIds: (number | string)[]) {
    return this.customAction(`${this.baseUrl}${id}/sync_tasks_execute/`, 'post', {
      process_ids: processIds,
      confirmed: true
    })
  }
}

export const workOrderAPI = new WorkOrderAPI()
export default workOrderAPI
