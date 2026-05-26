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

  /**
   * 导出产品为 Excel
   * @returns {Promise<Blob>} Excel 文件
   */
  exportProducts(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}export/`,
      method: 'get',
      params,
      responseType: 'blob'
    })
  }

  /**
   * 从 Excel 导入产品
   * @param {File} file - Excel 文件
   * @returns {Promise} 导入结果
   */
  importProducts(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this.request({
      url: `${this.baseUrl}import_products/`,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const productAPI = new ProductAPI()
export default productAPI
