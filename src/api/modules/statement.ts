/**
 * Statement API Module
 * 对账单管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class StatementAPI extends BaseAPI {
  constructor() {
    super('/statements/', request)
  }

  /**
   * 确认对账单
   * @param {number} id - 对账单ID
   * @param {Object} data - 确认信息
   * @returns {Promise} 确认结果
   */
  confirm(id: number | string, data: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/confirm/`,
      method: 'post',
      data
    })
  }

  /**
   * 获取对账单汇总
   * @param {Object} params - 汇总筛选参数
   * @returns {Promise} 对账单汇总数据
   */
  getSummary(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}summary/`,
      method: 'get',
      params
    })
  }

  /**
   * 生成对账单
   * @param {Object} params - 生成参数
   * @returns {Promise} 生成结果
   */
  generate(params: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}generate/`,
      method: 'get',
      params
    })
  }
}

export const statementAPI = new StatementAPI()
export default statementAPI
