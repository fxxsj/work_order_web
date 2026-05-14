/**
 * 图稿管理 API
 *
 * 提供图稿的完整 CRUD 操作，以及确认和版本管理功能。
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class ArtworkAPI extends BaseAPI {
  constructor() {
    super('/artworks/', request)
  }

  /**
   * 确认图稿
   * @param {number} id - 图稿 ID
   * @returns {Promise} API 响应
   */
  confirm(id) {
    return this.request({
      url: `${this.baseUrl}${id}/confirm/`,
      method: 'post'
    })
  }

  /**
   * 基于现有图稿创建新版本
   * @param {number} id - 源图稿 ID
   * @returns {Promise} API 响应
   */
  createVersion(id) {
    return this.request({
      url: `${this.baseUrl}${id}/create_version/`,
      method: 'post'
    })
  }

  /**
   * 获取图稿图片列表
   * @param {number} id - 图稿ID
   * @returns {Promise} 图片列表
   */
  getImages(id) {
    return this.request({
      url: `${this.baseUrl}${id}/images/`,
      method: 'get'
    })
  }

  /**
   * 上传图稿图片
   * @param {number} id - 图稿ID
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
   * 删除图稿图片
   * @param {number} id - 图稿ID
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

export const artworkAPI = new ArtworkAPI()
export default artworkAPI
