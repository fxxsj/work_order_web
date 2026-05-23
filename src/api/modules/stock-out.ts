/**
 * Stock Out API Module
 * 出库单管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class StockOutAPI extends BaseAPI {
  constructor() {
    super('/stock-outs/', request)
  }

  /**
   * 审核出库单
   * @param {number} id - 出库单ID
   * @returns {Promise} 审核结果
   */
  approve(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/approve/`,
      method: 'post'
    })
  }

  /**
   * 获取出库汇总
   * @returns {Promise} 出库汇总数据
   */
  getSummary() {
    return this.request({
      url: `${this.baseUrl}summary/`,
      method: 'get'
    })
  }
}

export const stockOutAPI = new StockOutAPI()
export default stockOutAPI
