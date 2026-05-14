/**
 * 刀模管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class DieAPI extends BaseAPI {
  constructor() {
    super('/dies/', request)
  }

  /**
   * 确认刀模
   * @param {number} id - 刀模ID
   * @returns {Promise} 确认后的刀模数据
   */
  confirm(id) {
    return this.request({
      url: `${this.baseUrl}${id}/confirm/`,
      method: 'post'
    })
  }

  /**
   * 获取刀模图片列表
   * @param {number} id - 刀模ID
   * @returns {Promise} 图片列表
   */
  getImages(id) {
    return this.request({
      url: `${this.baseUrl}${id}/images/`,
      method: 'get'
    })
  }

  /**
   * 上传刀模图片
   * @param {number} id - 刀模ID
   * @param {FormData} formData - 包含图片文件的 FormData
   * @returns {Promise} 上传结果
   */
  uploadImage(id, formData) {
    return this.request({
      url: `${this.baseUrl}${id}/upload_image/`,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  /**
   * 删除刀模图片
   * @param {number} id - 刀模ID
   * @param {number} imageId - 图片ID
   * @returns {Promise} 删除结果
   */
  deleteImage(id, imageId) {
    return this.request({
      url: `${this.baseUrl}${id}/images/${imageId}/`,
      method: 'delete'
    })
  }
}

export const dieAPI = new DieAPI()
export default dieAPI
