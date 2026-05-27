/**
 * Sales Order API Module
 * 销售订单管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'
import { workOrderFlowAPI } from './workorder-flow'

class SalesOrderAPI extends BaseAPI {
  constructor() {
    super('/sales-orders/', request)
  }

  /**
   * 提交销售订单
   * @param {number} id - 订单ID
   * @returns {Promise} 提交结果
   */
  submit(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/submit/`,
      method: 'post'
    })
  }

  /**
   * 审核通过销售订单
   * @param {number} id - 订单ID
   * @param {Object} data - 审核信息
   * @returns {Promise} 审核结果
   */
  approve(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/approve/`,
      method: 'post',
      data
    })
  }

  /**
   * 拒绝销售订单
   * @param {number} id - 订单ID
   * @param {Object} data - 拒绝原因
   * @returns {Promise} 拒绝结果
   */
  reject(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/reject/`,
      method: 'post',
      data
    })
  }

  /**
   * 开始生产
   * @param {number} id - 订单ID
   * @returns {Promise} 开始生产结果
   */
  startProduction(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/start_production/`,
      method: 'post'
    })
  }

  /**
   * 完成订单
   * @param {number} id - 订单ID
   * @returns {Promise} 完成结果
   */
  complete(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/complete/`,
      method: 'post'
    })
  }

  /**
   * 取消订单
   * @param {number} id - 订单ID
   * @param {Object} data - 取消原因
   * @returns {Promise} 取消结果
   */
  cancel(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/cancel/`,
      method: 'post',
      data
    })
  }

  /**
   * 更新付款信息
   * @param {number} id - 订单ID
   * @param {Object} data - 付款信息
   * @returns {Promise} 更新结果
   */
  updatePayment(id: number | string, data: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/update_payment/`,
      method: 'post',
      data
    })
  }

  /**
   * 从销售订单创建施工单
   */
  convertToWorkOrder(id: number | string, data: Record<string, unknown> = {}) {
    return workOrderFlowAPI.createFromSalesOrder({
      sales_order_id: id,
      ...data
    })
  }

  /**
   * 批量从销售订单创建施工单
   */
  batchConvertToWorkOrder(ids: Array<number | string>, data: Record<string, unknown> = {}) {
    return workOrderFlowAPI.createFromSalesOrders({
      sales_order_ids: ids,
      allow_partial: true,
      ...data
    })
  }
}

export const salesOrderAPI = new SalesOrderAPI()
export default salesOrderAPI
