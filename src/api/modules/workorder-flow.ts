/**
 * WorkOrder Flow API Module
 * 施工单流程（从销售订单创建/提交/审核等）
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class WorkOrderFlowAPI extends BaseAPI {
  constructor() {
    super('/workorders-flow/', request)
  }

  /**
   * 从销售订单创建施工单
   * @param {Object} data - { sales_order_id, production_quantity?, delivery_date?, priority?, notes? }
   * @returns {Promise} 创建结果
   */
  createFromSalesOrder(data: unknown) {
    return this.customAction(`${this.baseUrl}create_from_sales_order/`, 'post', data)
  }

  /**
   * 批量从销售订单创建施工单
   * @param {Object} data - { sales_order_ids, production_quantity?, delivery_date?, priority?, notes? }
   * @returns {Promise} 创建结果
   */
  createFromSalesOrders(data: unknown) {
    return this.customAction(`${this.baseUrl}create_from_sales_orders/`, 'post', data)
  }

  /**
   * 提交审批
   * @param {Object} data - { work_order_id, ... }
   * @returns {Promise} 提交结果
   */
  submitApproval(data: unknown) {
    return this.customAction(`${this.baseUrl}submit_approval/`, 'post', data)
  }

  /**
   * 审批通过
   * @param {Object} data - { work_order_id, ... }
   * @returns {Promise} 审批结果
   */
  approve(data: unknown) {
    return this.customAction(`${this.baseUrl}approve/`, 'post', data)
  }

  /**
   * 拒绝施工单
   * @param {Object} data - { work_order_id, ... }
   * @returns {Promise} 拒绝结果
   */
  reject(data: unknown) {
    return this.customAction(`${this.baseUrl}reject/`, 'post', data)
  }

  /**
   * 检查完成状态
   * @param {Object} data - { work_order_id }
   * @returns {Promise} 检查结果
   */
  checkCompletion(data: unknown) {
    return this.customAction(`${this.baseUrl}check_completion/`, 'post', data)
  }

  /**
   * 标记紧急
   * @param {Object} data - { work_order_id, reason? }
   * @returns {Promise} 标记结果
   */
  markUrgent(data: unknown) {
    return this.customAction(`${this.baseUrl}mark_urgent/`, 'post', data)
  }
}

export const workOrderFlowAPI = new WorkOrderFlowAPI()
export default workOrderFlowAPI
