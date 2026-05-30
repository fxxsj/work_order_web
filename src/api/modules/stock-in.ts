/**
 * Stock In API Module
 * 入库单管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class StockInAPI extends BaseAPI {
  constructor() {
    super('/stock-ins/', request)
  }

  /**
   * 提交入库单
   * @param {number} id - 入库单ID
   * @returns {Promise} 提交结果
   */
  submit(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/submit/`,
      method: 'post',
      data
    })
  }

  /**
   * 审核入库单
   * @param {number} id - 入库单ID
   * @returns {Promise} 审核结果
   */
  approve(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/approve/`,
      method: 'post'
    })
  }

  /**
   * 获取入库汇总
   * @returns {Promise} 入库汇总数据
   */
  getSummary(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}summary/`,
      method: 'get',
      params
    })
  }
}

export const stockInAPI = new StockInAPI()
export default stockInAPI
