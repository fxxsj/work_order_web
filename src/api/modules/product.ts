/**
 * 产品管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class ProductAPI extends BaseAPI {
  constructor() {
    super('/products/', request)
  }

  /**
   * 获取产品图片列表
   * @param {number} id - 产品ID
   * @returns {Promise} 图片列表
   */
  getImages(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/images/`,
      method: 'get'
    })
  }

  /**
   * 上传产品图片
   * @param {number} id - 产品ID
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
   * 删除产品图片
   * @param {number} id - 产品ID
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

export const productAPI = new ProductAPI()
export default productAPI
