/**
 * Purchase Order API Module
 * 采购单管理 API
 */
import request from '@/api/index'
import { BaseAPI } from '@/api/base/BaseAPI'

class PurchaseOrderAPI extends BaseAPI {
  constructor() {
    super('/purchase-orders/', request)
  }

  /**
   * 提交采购单
   */
  submit(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/submit/`,
      method: 'post',
      data
    })
  }

  /**
   * 批准采购单
   */
  approve(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/approve/`,
      method: 'post'
    })
  }

  /**
   * 拒绝采购单
   */
  reject(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/reject/`,
      method: 'post',
      data
    })
  }

  /**
   * 确认下单
   */
  placeOrder(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/place_order/`,
      method: 'post',
      data
    })
  }

  /**
   * 分批收货（改进版）
   * @param {number} id - 采购单ID
   * @param {object} data - 收货数据
   * @param {array} data.items - 收货明细列表 [{item_id, received_quantity, delivery_note_number, notes}]
   * @param {string} data.received_date - 收货日期（可选）
   */
  receive(id: number | string, data?: unknown) {
    return this.request({
      url: `${this.baseUrl}${id}/receive/`,
      method: 'post',
      data
    })
  }

  /**
   * 获取采购单的所有收货记录
   */
  getReceiveRecords(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/receive_records/`,
      method: 'get'
    })
  }

  /**
   * 获取待质检的收货记录
   */
  getPendingInspections(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/pending_inspections/`,
      method: 'get'
    })
  }

  /**
   * 取消采购单
   */
  cancel(id: number | string) {
    return this.request({
      url: `${this.baseUrl}${id}/cancel/`,
      method: 'post'
    })
  }

  /**
   * 获取库存不足的物料列表
   */
  getLowStockMaterials() {
    return this.request({
      url: `${this.baseUrl}low_stock_materials/`,
      method: 'get'
    })
  }

  /**
   * 从施工单创建采购单
   * @param {number} workOrderId - 施工单ID
   * @param {Array} materialIds - 物料ID列表（可选，不传则创建所有 pending 状态的物料）
   * @param {object} options - 可选参数 { supplier_id, notes }
   */
  createFromWorkOrder(workOrderId: number | string, materialIds: number | string | null = null, options: Record<string, unknown> = {}) {
    return this.request({
      url: `${this.baseUrl}create_from_work_order/`,
      method: 'post',
      data: {
        work_order_id: workOrderId,
        material_ids: materialIds,
        ...options
      }
    })
  }

  /**
   * 获取采购汇总（按物料维度）
   */
  getProcurementSummary(params: Record<string, unknown> = {}) {
    return this.request({
      url: `${this.baseUrl}procurement_summary/`,
      method: 'get',
      params
    })
  }

  /**
   * 获取采购延迟预警
   */
  getDelayWarnings(params: Record<string, unknown> = {}) {
    return this.request({
      url: `${this.baseUrl}delay_warnings/`,
      method: 'get',
      params
    })
  }
}

export const purchaseOrderAPI = new PurchaseOrderAPI()
export default purchaseOrderAPI
