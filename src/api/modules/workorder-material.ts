/**
 * 施工单物料管理 API
 * 复杂模块：包含 CRUD + 批量操作
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class WorkOrderMaterialAPI extends BaseAPI {
  constructor() {
    super('/workorder-materials/', request)
  }

  // 使用 patch 而非 put 进行更新
  update<T = unknown>(id: number | string, data: unknown): Promise<T> {
    return this.patch<T>(id, data)
  }

  // 批量出库
  batchCheckout(data: Record<string, unknown>) {
    return this.batchAction({
      action: 'checkout',
      ...data
    })
  }

  // 批量入库
  batchCheckin(data: Record<string, unknown>) {
    return this.batchAction({
      action: 'checkin',
      ...data
    })
  }
}

export const workOrderMaterialAPI = new WorkOrderMaterialAPI()
export default workOrderMaterialAPI
