import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class MaterialAPI extends BaseAPI {
  constructor() {
    super('/materials/', request)
  }

  /**
   * 导出物料为 Excel
   * @returns {Promise<Blob>} Excel 文件
   */
  exportMaterials(params?: Record<string, unknown>) {
    return this.request({
      url: `${this.baseUrl}export/`,
      method: 'get',
      params,
      responseType: 'blob'
    })
  }

  /**
   * 从 Excel 导入物料
   * @param {File} file - Excel 文件
   * @returns {Promise} 导入结果
   */
  importMaterials(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return this.request({
      url: `${this.baseUrl}import_materials/`,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const materialAPI = new MaterialAPI()
export default materialAPI
