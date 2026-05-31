/**
 * WorkOrder Flow API Module
 * 施工单流程（从客户订单创建/提交/审核等）
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class WorkOrderFlowAPI extends BaseAPI {
  constructor() {
    super('/workorders-flow/', request)
  }

  /**
   * 从客户订单创建施工单
   * @param {Object} data - { sales_order_id, production_quantity?, delivery_date?, priority?, notes? }
   * @returns {Promise} 创建结果
   */
  createFromSalesOrder(data: unknown) {
    return this.customAction(`${this.baseUrl}create_from_sales_order/`, 'post', data)
  }

  /**
   * 批量从客户订单创建施工单
   * @param {Object} data - { sales_order_ids, production_quantity?, delivery_date?, priority?, notes? }
   * @returns {Promise} 创建结果
   */
  createFromSalesOrders(data: unknown) {
    return this.customAction(`${this.baseUrl}create_from_sales_orders/`, 'post', data)
  }

  /**
   * 提交审批
   */
  submitApproval(id: number | string, data?: unknown) {
    return this.customAction(`${this.baseUrl}${id}/submit_approval/`, 'post', data)
  }

  /**
   * 审批通过
   */
  approve(id: number | string, data?: unknown) {
    return this.customAction(`${this.baseUrl}${id}/approve/`, 'post', data)
  }

  /**
   * 拒绝施工单
   */
  reject(id: number | string, data?: unknown) {
    return this.customAction(`${this.baseUrl}${id}/reject/`, 'post', data)
  }

  /**
   * 检查完成状态
   */
  checkCompletion(id: number | string) {
    return this.customAction(`${this.baseUrl}${id}/check_completion/`, 'post')
  }

  /**
   * 标记紧急
   */
  markUrgent(id: number | string, data: unknown) {
    return this.customAction(`${this.baseUrl}${id}/mark_urgent/`, 'post', data)
  }
}

export const workOrderFlowAPI = new WorkOrderFlowAPI()
export default workOrderFlowAPI
