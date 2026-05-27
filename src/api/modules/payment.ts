/**
 * Payment API Module
 * 收款管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class PaymentAPI extends BaseAPI {
  constructor() {
    super('/payments/', request)
  }

  /**
   * 获取收款汇总
   * @param {Object} params - 汇总筛选参数
   * @returns {Promise} 收款汇总数据
   */
  getSummary(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}summary/`,
      method: 'get',
      params
    })
  }
}

export const paymentAPI = new PaymentAPI()
export default paymentAPI
