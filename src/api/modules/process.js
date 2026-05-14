/**
 * 工序管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class ProcessAPI extends BaseAPI {
  constructor() {
    super('/processes/', request)
  }

  /**
   * 获取所有工序（不分页，用于下拉选择）
   * @param {Object} params - 查询参数
   * @param {boolean} params.is_active - 是否只返回启用的工序
   * @returns {Promise} 所有工序列表
   */
  getAll(params = {}) {
    return this.request({
      url: `${this.baseUrl}all/`,
      method: 'get',
      params
    })
  }

  /**
   * 批量更新工序启用状态
   * @param {Object} data - { ids: number[], is_active: boolean }
   * @returns {Promise} 更新结果
   */
  batchUpdateActive(data) {
    return this.request({
      url: `${this.baseUrl}batch_update_active/`,
      method: 'post',
      data
    })
  }
}

export const processAPI = new ProcessAPI()
export default processAPI
