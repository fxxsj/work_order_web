/**
 * 烫金版管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class FoilingPlateAPI extends BaseAPI {
  constructor() {
    super('/foiling-plates/', request)
  }

  /**
   * 确认烫金版
   * @param {number} id - 烫金版 ID
   * @returns {Promise} API 响应
   */
  confirm(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/confirm/`,
      method: 'post'
    })
  }

  /**
   * 获取烫金版图片列表
   * @param {number} id - 烫金版ID
   * @returns {Promise} 图片列表
   */
  getImages(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/images/`,
      method: 'get'
    })
  }

  /**
   * 上传烫金版图片
   * @param {number} id - 烫金版ID
   * @param {FormData} formData - 包含图片文件的 FormData
   * @returns {Promise} 上传结果
   */
  uploadImage(id: number | string, formData: FormData) {
    return this.request({
      url: `${this.baseUrl}${id}/upload_image/`,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  /**
   * 删除烫金版图片
   * @param {number} id - 烫金版ID
   * @param {number} imageId - 图片ID
   * @returns {Promise} 删除结果
   */
  deleteImage(id: number | string, imageId: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/images/${imageId}/`,
      method: 'delete'
    })
  }
}

export const foilingPlateAPI = new FoilingPlateAPI()
export default foilingPlateAPI
